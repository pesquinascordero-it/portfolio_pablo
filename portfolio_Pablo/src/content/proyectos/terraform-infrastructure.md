# Infraestructura en Terraform

## Qué problema resuelve

Provisionar infraestructura manualmente es lento, propenso a errores y difícil de reproducir. Con Terraform, defines tu infraestructura como código (IaC), la versionas en Git y la despliegas de forma reproducible y automatizada.

## Stack

- **Terraform** (IaC) para provisionar recursos AWS
- **AWS** (EC2, RDS, S3, VPC) como proveedor cloud
- **GitHub Actions** para CI/CD y despliegues automáticos
- **Docker** para containerizar aplicaciones

## Estructura del proyecto

```
terraform/
├── main.tf               # Configuración principal
├── variables.tf          # Input variables
├── outputs.tf            # Output values
├── vpc.tf                # Networking
├── rds.tf                # Base de datos
├── ec2.tf                # Instancias
├── s3.tf                 # Storage
├── terraform.tfvars      # Valores (NO commiteado)
├── terraform.tfstate     # Estado (en S3 remoto)
├── .gitignore
└── .github/
    └── workflows/
        └── deploy.yml    # GitHub Actions
```

## Configuración principal

### main.tf

```hcl
terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Almacena el estado en S3 (compartido y seguro)
  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "eu-west-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region
}
```

### variables.tf

```hcl
variable "aws_region" {
  type        = string
  default     = "eu-west-1"
  description = "AWS region"
}

variable "environment" {
  type        = string
  default     = "prod"
  description = "Environment name"
}

variable "app_name" {
  type        = string
  default     = "my-app"
  description = "Application name"
}

variable "instance_type" {
  type        = string
  default     = "t3.micro"
  description = "EC2 instance type"
}

variable "db_username" {
  type        = string
  sensitive   = true
  description = "Database master username"
}

variable "db_password" {
  type        = string
  sensitive   = true
  description = "Database master password"
}
```

## VPC y Networking

### vpc.tf

```hcl
# VPC con dos subnets públicas y dos privadas
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.app_name}-vpc"
  }
}

# Subnets públicas
resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.${count.index + 1}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.app_name}-public-subnet-${count.index + 1}"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.app_name}-igw"
  }
}

# Rutas públicas
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block      = "0.0.0.0/0"
    gateway_id      = aws_internet_gateway.main.id
  }

  tags = {
    Name = "${var.app_name}-public-rt"
  }
}

resource "aws_route_table_association" "public" {
  count          = 2
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}
```

## Base de datos RDS

### rds.tf

```hcl
resource "aws_db_subnet_group" "main" {
  name       = "${var.app_name}-db-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "${var.app_name}-db-subnet-group"
  }
}

resource "aws_rds_instance" "main" {
  identifier     = "${var.app_name}-db"
  engine         = "postgres"
  engine_version = "15.3"
  instance_class = "db.t3.micro"
  allocated_storage = 20

  db_name  = "appdb"
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  skip_final_snapshot       = false
  final_snapshot_identifier = "${var.app_name}-db-final-snapshot"

  tags = {
    Name = "${var.app_name}-db"
  }
}
```

## Instancias EC2

### ec2.tf

```hcl
resource "aws_security_group" "app" {
  name_prefix = "${var.app_name}-app-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["YOUR_IP/32"]  # Restringe a tu IP
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.app_name}-app-sg"
  }
}

resource "aws_instance" "app" {
  count                = 2
  ami                  = data.aws_ami.ubuntu.id
  instance_type        = var.instance_type
  subnet_id            = aws_subnet.public[count.index].id
  vpc_security_group_ids = [aws_security_group.app.id]
  iam_instance_profile = aws_iam_instance_profile.app.name

  user_data = base64encode(templatefile("${path.module}/user_data.sh", {
    app_name = var.app_name
  }))

  tags = {
    Name = "${var.app_name}-app-${count.index + 1}"
  }

  depends_on = [aws_internet_gateway.main]
}
```

## CI/CD con GitHub Actions

### .github/workflows/deploy.yml

```yaml
name: Deploy Infrastructure

on:
  push:
    branches: [main]
    paths: ['terraform/**']
  pull_request:
    paths: ['terraform/**']

jobs:
  terraform:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - uses: hashicorp/setup-terraform@v2
        with:
          terraform_version: 1.5.0

      - name: Terraform Init
        run: terraform init
        working-directory: terraform

      - name: Terraform Plan
        run: terraform plan -out=tfplan
        working-directory: terraform
        env:
          TF_VAR_db_username: ${{ secrets.DB_USERNAME }}
          TF_VAR_db_password: ${{ secrets.DB_PASSWORD }}

      - name: Terraform Apply
        if: github.ref == 'refs/heads/main'
        run: terraform apply -auto-approve tfplan
        working-directory: terraform
        env:
          TF_VAR_db_username: ${{ secrets.DB_USERNAME }}
          TF_VAR_db_password: ${{ secrets.DB_PASSWORD }}
```

## Despliegue

```bash
# 1. Inicializar Terraform (descarga proveedores y estado remoto)
terraform init

# 2. Revisar cambios (plan)
terraform plan -out=tfplan

# 3. Aplicar (provisiona la infraestructura)
terraform apply tfplan

# 4. Ver outputs (IPs, DNS, etc.)
terraform output

# 5. Destruir (si quieres limpiar todo)
terraform destroy
```

## Decisiones de diseño

| Aspecto | Decisión | Por qué |
|--------|----------|---------|
| **State Backend** | S3 remoto + DynamoDB | Compartir estado entre desarrolladores, locking automático |
| **Multi-AZ** | 2 subnets públicas en zonas distintas | Alta disponibilidad, failover automático |
| **RDS** | db.t3.micro | Gratuito (capa free), suficiente para desarrollo |
| **IAM Roles** | EC2 asume rol (no API keys) | Seguro, sin credenciales en variables |
| **CI/CD** | GitHub Actions | Integrado en el repo, sin servidor adicional |

## Qué aprendí

- **Terraform es potente pero requiere disciplina**: pequeños cambios en code pueden desplegar infraestructura.
- **State es crítico**: perderlo es desastroso; siempre usa backend remoto con locking.
- **Modularity**: organiza code por recursos lógicos (vpc.tf, rds.tf) para mantenibilidad.
- **Plan antes de aplicar**: `terraform plan` evita sorpresas.

## Próximos pasos

- Autoscaling: ASG + ALB
- Monitoring: CloudWatch + SNS
- SSL/TLS: AWS Certificate Manager + CloudFront
- Secretos: AWS Secrets Manager en lugar de variables
