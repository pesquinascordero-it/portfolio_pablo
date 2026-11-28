## 1. Descripción

TFG de Ingeniería en Sistemas de Información por la Universidad de Alcalá. Análisis con Machine Learning para predecir la actividad de la vía **ALT** (*Alternative Lengthening of Telomeres* — alargamiento alternativo de telómeros) a partir de datos clínicos y genómicos de pacientes con cáncer.

Los datos pertenecen a Hartwig Medical Foundation / ICGC y tienen acceso controlado. No se incluyen en el repositorio por razones de privacidad, pero los notebooks contienen el código del análisis y las notas con los resultados.

### 1.1 Objetivo

Identificar qué variables —tipo de tumor, mutaciones en genes driver, y tratamientos recibidos— se asocian con la actividad ALT, y comparar distintos modelos de regresión para predecir la **tasa de fusiones teloméricas** en tumor y sangre periférica.

## 2. Datos y preparación

**4.535 pacientes** del archivo de metadatos (nulos categóricos convertidos a 'Sin_dato'). El conjunto de entrenamiento es 80 % (aproximadamente 3.600 pacientes).

### 2.1 Target

Columna principal: `Tumor_Telomere fusion rate (Gt-end/coverage*purity)`. Se aplica transformación **log1p** (logaritmo natural de 1 + valor) para estabilizar varianza.

**Umbral ALT-positivo**: pacientes con tasa de fusiones > 0,2 → **338 pacientes**.

### 2.2 Variables

Después de seleccionar características con baja tasa de nulos:

- **Tipo de tumor**: `cancer_type` y `Mixed_def` (58 columnas tras one-hot encoding); origen mesenquimal, derivado del tipo de tumor.
- **Mutaciones en genes driver**: un flag binario por gen, solo genes con ≥ 10 pacientes en el dataset.
- **Tratamientos**: `treatment1`, `treatmentGiven`, `hasSystemicPreTreatment`, `hasRadiotherapyPreTreatment`.
- **Respuesta al tratamiento**: `firstResponse`.
- **Sitio de biopsia**: `biopsySite`.

### 2.3 Preparación

Se eliminaron columnas con más del 50 % de nulos. Los nulos categóricos se convirtieron a 'Sin_dato'; las categorías poco frecuentes se agruparon en 'Otro' (top 15 tratamientos, top 10 lugares de biopsia, top 10 primer tratamiento). Se aplicó one-hot encoding para variables categóricas.

## 3. Modelos y validación

**Metodología**: split 80/20 (`random_state=42`), 5-fold CV (sin estratificación), scoring métrica = R²

| Modelo | Tipo | Propósito |
|--------|------|----------|
| Lasso | Regresión L1 | Selecciona variables, pone coeficientes a 0 |
| Ridge | Regresión L2 | Reparte el peso entre variables correlacionadas |
| Elastic Net | L1 + L2 | Combina L1 y L2 |
| Random Forest | Ensemble | Captura relaciones no lineales |
| XGBoost | Gradient boosting | Captura relaciones no lineales |
| LightGBM | Gradient boosting | Captura relaciones no lineales |
| Hurdle | Binario + regresión | Separa si hay fusiones y cuántas |
| TabPFN | Red pre-entrenada | Modelo preentrenado para datos tabulares |

## 4. Resultados e interpretabilidad

### 4.1 Desempeño por modelo (target: Tumor)

Target principal transformado con log1p:

- **Lasso, alpha 0.001 (03c)**: R² test 0,0846; R² CV 0,0554 ± 0,0282.
- **Ridge, alpha fijo (03c)**: R² CV 0,0347.
- **Elastic Net, alpha fijo (03c)**: R² CV 0,0455.
- **Lasso optimizado con Optuna (03j, alpha 0,004642)**: R² CV 0,0617.
- **Hurdle (03i, split 80/20 fijo)**: R² 0,0484.
- **TabPFN (03i, split fijo)**: 0,100; promedio con 5 semillas: 0,085 ± 0,016.
- **Random Forest, XGBoost y LightGBM**: se probaron en 03b y 03d, también con Optuna; el repo no documenta su R².
- **Sangre (target: `Blood_Telomere fusion rate`, notebook 03h)**: Lasso R² CV 0,0531.

### 4.2 Optimización con Optuna (notebook 03j)

*`03j_optuna_hyperparams.ipynb`*

```python
def objective_lasso(trial):
    alpha = trial.suggest_float('alpha', 1e-4, 10.0, log=True)
    pipe  = Pipeline([('scaler', StandardScaler()),
                      ('model',  Lasso(alpha=alpha, max_iter=10000, random_state=42))])
    scores = cross_val_score(pipe, X, y, cv=kf, scoring='r2')
    return scores.mean()
```

Optuna prueba valores de alpha en escala logarítmica (entre 1e-4 y 10.0) y elige el que maximiza el R² medio de la validación cruzada. El escalado StandardScaler dentro del Pipeline evita que información del conjunto de validación filtre hacia el entrenamiento.

### 4.3 SHAP (notebook 03k)

Interpretabilidad del Lasso optimizado usando `shap.LinearExplainer()`. Se generaron gráficos de barras (importancia global), beeswarm (importancia y dirección del efecto de cada variable) y waterfall (explicación individual).

### 4.4 Mutaciones driver (notebook 04)

Ranking de genes por tasa media de fusiones (mínimo 10 pacientes en el dataset). El análisis destaca genes relacionados con ALT (ATRX, DAXX), histonas (H3-3A, H3-3B) y proteínas de los telómeros (POT1, TERT).

Tasa media global de fusiones: 0,107.

## 5. Aprendizajes

- **R² bajo (entre 0,05 y 0,10) como resultado legítimo**: las variables disponibles (tipos de tumor, tratamientos, mutaciones en genes driver) explican una fracción pequeña de la variación en la tasa de fusiones teloméricas. Es un hallazgo en sí mismo, no un fallo del modelo.
- **Optuna mejora respecto a alpha fijo**: el valor optimizado (0,004642) mejora el R² CV de 0,0554 a 0,0617, demostrando la importancia de la búsqueda de hiperparámetros.
- **Pipeline escalado evita fuga de datos**: colocar StandardScaler dentro del Pipeline garantiza que el escalado se ajusta solo con los datos de entrenamiento de cada partición.
- **Transformación log1p necesaria**: el target tiene distribución muy asimétrica (muchos ceros, algunos outliers altos); sin transformación, la regresión es inestable.
- **Hurdle y TabPFN no mejoran al Lasso**: modelos más complejos no superan claramente el Lasso, sugiriendo que la complejidad adicional no está justificada por los datos disponibles.

## 6. Mejoras futuras

- Validación externa con una cohorte independiente para evaluar generalización.
- Feature engineering: ratios de mutaciones, covariables clínicas adicionales disponibles en la base de datos.
- Combinaciones de modelos: ensemble simple de múltiples algoritmos.
