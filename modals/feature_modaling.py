import pandas as pd
import numpy as np
import os

# Load cumulative label file
labels = pd.read_csv("/content/all_features.csv")

# Example labels.csv columns: kepid, disposition
# disposition could be "CONFIRMED", "FALSE POSITIVE", etc.
print("📝 Column Names:")
print(labels.columns.tolist())
print("\nTotal Columns:", len(labels.columns))

# Display first 10 values for each column
print("\n🔹 First 10 values for each column:\n")
for col in labels.columns:
    print(f"--- {col} ---")
    print(labels[col].head(10).to_list())  # convert to list for cleaner display
    print()

# ✅ Columns we want to keep
columns_to_keep = [
    'kepid',              # Unique identifier
    'koi_disposition',    # Planet label (CONFIRMED / FALSE POSITIVE)
    'koi_period',         # Transit period
    'koi_depth',          # Transit depth
    'koi_prad',           # Planet radius (if available)
    'koi_teq',            # Equilibrium temperature (optional)
    'koi_steff',          # Stellar effective temperature
    'koi_srad',           # Stellar radius
    'koi_model_snr'       # Signal-to-noise ratio
]

# Filter the DataFrame to keep only these columns
clean_df = df[columns_to_keep].copy()

# Optional: drop rows with missing critical values (like kepid or disposition)
clean_df.dropna(subset=['kepid', 'koi_disposition'], inplace=True)

# Save to a new CSV file
output_path = "/content/clean_labels.csv"
clean_df.to_csv(output_path, index=False)

print(f"✅ Cleaned file saved at: {output_path}")
print("📝 Columns in clean file:", clean_df.columns.tolist())
print("\n📊 Preview:")
print(clean_df.head(10))

# Paths
labels_csv = "/content/clean_labels_with_derived.csv"
lightcurve_folder = "/content/drive/MyDrive/Data"

# Load CSV
df = pd.read_csv(labels_csv)

# 1️⃣ Convert koi_disposition to binary
df['target'] = df['koi_disposition'].apply(lambda x: 1 if x in ['CONFIRMED', 'CANDIDATE'] else 0)

# 2️⃣ Map lightcurve files for each kepid
def get_lightcurve_file(kepid):
    filename = f"kepler_{kepid}_lightcurve.csv"
    file_path = os.path.join(lightcurve_folder, filename)
    if os.path.exists(file_path):
        return file_path
    else:
        return None  # or "" if you prefer

df['lightcurve_file'] = df['kepid'].apply(get_lightcurve_file)

# Optional: drop rows with no corresponding lightcurve
df = df.dropna(subset=['lightcurve_file']).reset_index(drop=True)

# Save updated CSV
output_csv = "/content/clean_labels_with_derived_binary.csv"
df.to_csv(output_csv, index=False)

print(f"✅ Updated CSV saved at: {output_csv}")
print(df.head())

