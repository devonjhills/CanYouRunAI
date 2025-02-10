import itertools
import json
import re
from collections import Counter
import pandas as pd
import numpy as np
import subprocess
from playwright.sync_api import sync_playwright
from io import StringIO

def clean_html(html: str) -> str:
    replacements = [
        (r'<span [^>]*style="display:none[^>]*>([^<]+)</span>', ""),
        (r"<span[^>]*>([^<]+)</span>", r"\1"),
        (r"(\d)&#160;(\d)", r"\1\2"),
        (r"&thinsp;", ""),
        (r"&#8201;", ""),
        ("\xa0", " "),
        (r"&#160;", " "),
        (r"&nbsp;", " "),
        (r"<br />", " "),
        ("\u2012", "-"),
        ("\u2013", "-"),
        ("\u2014", ""),
        (r"mm<sup>2</sup>", "mm2"),
        ("\u00d710<sup>6</sup>", "\u00d7106"),
        ("\u00d710<sup>9</sup>", "\u00d7109"),
        (r"<sup>\d+</sup>", "")
    ]
    
    for pattern, replacement in replacements:
        html = re.sub(pattern, replacement, html)
    return html

def process_dataframe(df: pd.DataFrame, vendor: str) -> pd.DataFrame:
    # Clean column names
    df.columns = [
        " ".join(
            a for a, b in itertools.zip_longest(col, col[1:])
            if (a != b and not a.startswith("Unnamed: "))
        ).strip()
        for col in df.columns.values
    ]

    # Remove Arc suffix from column names
    df.columns = [re.sub(r" Arc [\w]*$", "", col) for col in df.columns.values]
    
    # Clean numbers and brackets from column names
    df.columns = [
        " ".join([re.sub(r"[\d,]+$", "", word) for word in col.split()])
        for col in df.columns.values
    ]
    df.columns = [
        " ".join([re.sub(r"(?:\[[a-zA-Z0-9]+\])+$", "", word) for word in col.split()])
        for col in df.columns.values
    ]

    # Additional column name cleaning
    df.columns = [col.replace("- ", "").replace("/ ", "/").strip() for col in df.columns.values]
    
    df["Vendor"] = vendor

    # Handle Launch and Release Price columns
    if ("Launch" not in df.columns.values) and ("Release Date & Price" in df.columns.values):
        df["Launch"] = df["Release Date & Price"].str.extract(r"^(.*\d\d\d\d)", expand=False)
        df["Release Price (USD)"] = df["Release Date & Price"].str.extract(r"(\$[\d,]+)", expand=False)

    # Clean Launch dates
    REFERENCES_AT_END = r"(?:\s*\[\d+\])+(?:\d+,)?(?:\d+)?$"
    if "Launch" in df.columns:
        df["Launch"] = df["Launch"].astype(str)
        df["Launch"] = df["Launch"].str.replace(REFERENCES_AT_END, "", regex=True)
        df["Launch"] = df["Launch"].str.extract(r"^(.*?[\d]{4})", expand=False)
        df["Launch"] = pd.to_datetime(df["Launch"], errors="coerce")

    # Remove duplicate columns
    if [c for c in Counter(df.columns).items() if c[1] > 1]:
        df = df.loc[:, ~df.columns.duplicated()]

    return df

def remove_bracketed_references(df: pd.DataFrame, columns: list) -> pd.DataFrame:
    for col in columns:
        if col in df.columns:
            df[col] = df[col].astype(str).str.replace(r"\[\d+\]", "", regex=True).str.strip()
    return df

def scrape_wikipedia():
    pages = {
        "NVIDIA": "https://en.wikipedia.org/wiki/List_of_Nvidia_graphics_processing_units",
        "AMD": "https://en.wikipedia.org/wiki/List_of_AMD_graphics_processing_units",
        "Intel": "https://en.wikipedia.org/wiki/Intel_Xe"
    }
    
    all_dfs = []
    
    with sync_playwright() as p:
        browser = p.chromium.launch()
        
        try:
            for vendor, url in pages.items():
                print(f"Scraping {vendor} GPUs from {url}")
                page = browser.new_page()
                page.goto(url)
                
                # Get HTML content and clean it
                html_content = page.content()
                cleaned_html = clean_html(html_content)
                
                # Use StringIO to wrap the HTML content
                html_io = StringIO(cleaned_html)
                
                # Parse tables using pandas
                dfs = pd.read_html(html_io, match=re.compile("Launch|Release Date & Price"))
                processed_dfs = [process_dataframe(df, vendor) for df in dfs]
                all_dfs.extend(processed_dfs)
                
                page.close()
                
        finally:
            browser.close()
    
    # Combine all dataframes
    df = pd.concat(all_dfs, sort=False, ignore_index=True)
    
    # Clean specific columns
    df = remove_bracketed_references(df, ["Model", "Die size (mm2)"])
    
    # Convert to dictionary format
    result_dict = {}
    records = df.to_dict(orient="records")
    for row in records:
        temp_dict = {}
        for k, v in row.items():
            if pd.notna(v):  # Include non-NaN values
                temp_dict[k] = v
        code_name = row.get("Code name", "Unknown")
        result_dict[code_name] = temp_dict
    
    return result_dict

def update_cloudflare_kv(gpu_data):
    with open("gpu-data.json", "w", encoding="utf-8") as f:
        json.dump(gpu_data, f, indent=4, ensure_ascii=False, default=str)
    
    try:
        subprocess.run(
            ["npx", "wrangler", "kv:key", "put", "--binding=GPU_DATABASE", 
             "gpu-database", "--path=gpu-data.json"],
            check=True
        )
        print("Successfully uploaded data to Cloudflare KV")
    except subprocess.CalledProcessError as e:
        print(f"Failed to update KV store: {e}")
        raise

def main():
    try:
        print("Starting GPU database update...")
        gpu_data = scrape_wikipedia()
        update_cloudflare_kv(gpu_data)
        print(f"Successfully updated GPU database with {len(gpu_data)} GPU entries")
    except Exception as e:
        print(f"Failed to update GPU database: {e}")
        exit(1)

if __name__ == "__main__":
    main() 