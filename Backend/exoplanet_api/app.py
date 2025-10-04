import gradio as gr
import joblib
import pandas as pd
import numpy as np

# Load model and scaler
model = joblib.load("lgb_exoplanet_model.pkl")
scaler = joblib.load("scaler.pkl")

# ===============================
# Feature Extraction Function
# ===============================
def extract_features_from_lightcurve(file_obj):
    df = pd.read_csv(file_obj.name)
    flux = df['flux'].values
    flux_err = df['flux_err'].values if 'flux_err' in df.columns else np.zeros_like(flux)

    features = {
        'flux_mean': np.mean(flux),
        'flux_std': np.std(flux),
        'flux_median': np.median(flux),
        'flux_min': np.min(flux),
        'flux_max': np.max(flux),
        'flux_skew': pd.Series(flux).skew(),
        'flux_kurt': pd.Series(flux).kurt(),
    }

    flux_diff = features['flux_mean'] - flux
    features['dip_max'] = np.max(flux_diff)
    features['dip_mean'] = np.mean(flux_diff)
    features['dip_std'] = np.std(flux_diff)

    # Scale using same scaler
    X = pd.DataFrame([features])
    X_scaled = scaler.transform(X)

    # Predict
    prob = model.predict_proba(X_scaled)[0][1]
    pred = int(model.predict(X_scaled)[0])

    result = {
        "probability_of_existence": float(prob),
        "exoplanet": bool(pred == 1),
        "non_exoplanet": bool(pred == 0)
    }

    return result

# ===============================
# Gradio Interface
# ===============================
iface = gr.Interface(
    fn=extract_features_from_lightcurve,
    inputs=gr.File(label="Upload Lightcurve CSV"),
    outputs="json",
    title="Exoplanet Detection API",
    description="Upload a lightcurve CSV to predict exoplanet existence."
)

if __name__ == "__main__":
    iface.launch()
