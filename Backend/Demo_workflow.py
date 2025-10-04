
import pandas as pd
import numpy as np
import json

# 1️⃣ Load cumulative file, skipping NASA comment lines
file_path = '/content/cumulative_2025.09.06_23.30.01.csv'
df = pd.read_csv(file_path, comment='#')

print("Columns detected:", df.columns)

# 2️⃣ Functions to estimate mass and density
def estimate_mass(radius):
    """Estimate mass (Earth masses) from radius (Earth radii)"""
    if radius > 0:
        return radius**3.7
    else:
        return np.nan

def estimate_density(mass, radius):
    """Estimate density (g/cm³) from mass (Earth masses) and radius (Earth radii)"""
    if mass > 0 and radius > 0:
        volume = (4/3) * np.pi * (radius**3)  # Earth radii³
        density = mass / volume * 5.51        # scale factor to g/cm³
        return density
    else:
        return np.nan

# 3️⃣ Add derived columns
if 'koi_sma' in df.columns:
    df['pl_orbsmax'] = df['koi_sma'].fillna(df['koi_srad'])
else:
    df['pl_orbsmax'] = df['koi_srad']

df['pl_rade'] = df['koi_prad']
df['pl_masse'] = df['pl_rade'].apply(estimate_mass)
df['pl_dens'] = df.apply(lambda row: estimate_density(row['pl_masse'], row['pl_rade']), axis=1)
df['pl_eqt'] = df['koi_teq']

# 4️⃣ Function to generate JSON for a single planet row
def planet_to_json(planet):
    prob = 1.0 if str(planet.get("koi_disposition", "")).upper() == "CANDIDATE" else 0.0

    return {
        "Kepid": int(planet['kepid']),
        "prob_existence": prob,
        "features": {
            "pl_orbsmax": float(planet.get("pl_orbsmax", 0.0)),
            "pl_rade": float(planet.get("pl_rade", 0.0)),
            "pl_masse": float(planet.get("pl_masse", 0.0)),
            "pl_dens": float(planet.get("pl_dens", 0.0)),
            "pl_eqt": float(planet.get("pl_eqt", 0.0))
        }
    }

# 5️⃣ Take user input
kepid_input = int(input("Enter Kepid: "))

# 6️⃣ Filter dataframe for that Kepid
planet_row = df[df['kepid'] == kepid_input]

if not planet_row.empty:
    planet_json = planet_to_json(planet_row.iloc[0])
    print(json.dumps(planet_json, indent=4))
else:
    print(f"No planet found with Kepid {kepid_input}")


