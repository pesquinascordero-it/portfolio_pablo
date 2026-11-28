## 1. Qué es

Predecir niveles de ALT (alanina aminotransferasa) en 4.535 pacientes oncológicos para anticipar toxicidad hepática y personalizar tratamientos. Es mi TFG de ingeniería de datos: un reto real que combina machine learning con interpretabilidad en contexto médico.

**Stack**: Python, pandas, scikit-learn, XGBoost, LightGBM, TabPFN, SHAP.

### 1.1 Por qué lo hice

La toxicidad hepática es una complicación grave en tratamientos oncológicos. Un modelo que predice ALT elevado permite adelantarse a los problemas. La clave: no vale solo precisión, necesito explicar por qué el modelo predice lo que predice.

## 2. Dataset y preprocesamiento

Trabajo con 4.535 registros de pacientes. Cada uno tiene 50+ características clínicas (edad, comorbilidades, dosis de tratamiento) y demográficas. La variable objetivo es ALT, continua, en unidades de enzima hepática.

**Pipeline**: 
- Exploración: distribuciones asimétricas, correlaciones entre variables, detección de outliers con rango intercuartil (IQR).
- Limpieza: eliminar valores faltantes en la variable objetivo, rellenar ausencias numéricas con mediana, remover outliers extremos.
- Escalado: StandardScaler para algoritmos sensibles a escala (Lasso, Ridge, SVM).
- Selección: SelectKBest automático para elegir las 15 características más predictivas.

## 3. Modelos evaluados

Probé 7 modelos distintos para entender trade-offs entre precisión, velocidad e interpretabilidad.

| Modelo | Tipo | Ventaja | Desventaja |
|--------|------|---------|-----------|
| Lasso | Regresión lineal L1 | Interpretable, coeficientes claros | Menos flexible |
| Ridge | Regresión lineal L2 | Estable con multicolinealidad | Igual de lineal |
| Random Forest | Ensemble árboles | Robusta, importancia de features | Black box puro |
| **XGBoost** | Gradient boosting | Precisión y velocidad | Más lento que LGB |
| **LightGBM** | Gradient boosting | Muy rápido, buena precisión | A veces overfitting |
| TabPFN | Prior-fitted network | Sin tuning de parámetros | Experimental, lento |
| Hurdle | Dos etapas | Modela ceros y valores reales | Complejo de interpretar |

## 4. Interpretabilidad con SHAP

SHAP (SHapley Additive exPlanations) calcula cuánto cada variable contribuye a cada predicción, basado en teoría de juegos. Para cada observación, obtengo un valor que explica por qué el modelo predijo lo que predijo.

```python
# src/modeling/interpretability.py
import shap

explainer = shap.TreeExplainer(xgb_model)
shap_values = explainer.shap_values(X_test)
shap.summary_plot(shap_values, X_test, plot_type="bar", max_display=15)
```

Genera un ranking de genes predictivos: cuál mueve más la predicción. Crítico en medicina: el hospital necesita saber "¿por qué el modelo dice que este paciente tiene riesgo alto?". Sin SHAP, no hay respuesta.

## 5. Resultados

Estoy finalizando el modelo. Los resultados esperados:
- R² en test: 0.75+
- RMSE: 20-30 unidades de ALT
- Importancia SHAP consistente entre modelos (validación de estabilidad)
- 3-4 variables dominantes que capturan mayoría de la varianza

## 6. Qué aprendí

- **Feature engineering es 80% del trabajo**: la precisión vive o muere en la preparación de datos, no en el modelo.
- **SHAP no es opcional**: auditoría regulatoria, publicación científica, aprobación de médicos, todo requiere explicabilidad.
- **Trade-off constante**: precisión vs velocidad vs interpretabilidad. TabPFN es más lento pero no necesita scaling. XGBoost es más rápido pero requiere tuning.
- **ML clínico ≠ Kaggle**: datos desbalanceados, valores faltantes reales, validación estratificada obligatoria, reproducibilidad crítica.
- **Validación cruzada estratificada**: preservar distribución de la variable objetivo en cada fold evita modelos que aprenden el ruido.

## 7. Próximos pasos

- Validación externa: probar en dataset independiente de otro hospital.
- Publicación: documento científico con resultados y limitaciones.
- Implementación clínica: integración en sistema de historia electrónica.
- Monitoreo de drift: datos nuevos pueden cambiar distribuciones; vigilar.
- Ensemble final con votación ponderada de los 2-3 mejores modelos.
