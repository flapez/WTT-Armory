import os
import json
import customtkinter as ctk
from tkinter import filedialog, messagebox

CONFIG_PATH = "config.json"
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(SCRIPT_DIR, "config.json")


class LocaleSyncApp(ctk.CTk):
    def __init__(self):
        super().__init__()
        self.title("Locale Sync Tool")
        self.geometry("800x600")
        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("blue")

        self.items_dir = ""
        self.locales_dir = ""

        self.load_config()
        self.create_widgets()

    def create_widgets(self):
        self.items_button = ctk.CTkButton(self, text="Select Items Directory", command=self.select_items_dir)
        self.items_button.pack(pady=10)

        self.locales_button = ctk.CTkButton(self, text="Select Locales Directory", command=self.select_locales_dir)
        self.locales_button.pack(pady=10)

        self.sync_button = ctk.CTkButton(self, text="Start Sync", command=self.sync_locales)
        self.sync_button.pack(pady=10)

        self.logger = ctk.CTkTextbox(self, wrap="word", height=400)
        self.logger.pack(fill="both", expand=True, padx=10, pady=10)
        self.logger.insert("end", "Logger initialized...\n")

    def log(self, msg):
        self.logger.insert("end", msg + "\n")
        self.logger.see("end")
        self.update()

    def select_items_dir(self):
        self.items_dir = filedialog.askdirectory(title="Select Items Directory")
        self.log(f"Selected Items Directory: {self.items_dir}")

    def select_locales_dir(self):
        self.locales_dir = filedialog.askdirectory(title="Select Locales Directory")
        self.log(f"Selected Locales Directory: {self.locales_dir}")

    def load_config(self):
        if os.path.exists(CONFIG_PATH):
            with open(CONFIG_PATH, "r") as f:
                cfg = json.load(f)
                self.items_dir = os.path.abspath(os.path.join(SCRIPT_DIR, cfg.get("items_dir", "")))
                self.locales_dir = os.path.abspath(os.path.join(SCRIPT_DIR, cfg.get("locales_dir", "")))

    def save_config(self):
        items_rel = os.path.relpath(self.items_dir, SCRIPT_DIR)
        locales_rel = os.path.relpath(self.locales_dir, SCRIPT_DIR)
        cfg = {"items_dir": items_rel, "locales_dir": locales_rel}
        with open(CONFIG_PATH, "w") as f:
            json.dump(cfg, f, indent=2)

    def sync_locales(self):
        if not self.items_dir or not self.locales_dir:
            messagebox.showerror("Missing Input", "Please select both directories first.")
            return

        self.save_config()
        stats = {"created": 0, "updated": 0, "skipped": 0}

        for filename in os.listdir(self.items_dir):
            if not filename.endswith(".json"):
                continue

            with open(os.path.join(self.items_dir, filename), "r", encoding="utf-8") as f:
                try:
                    items_data = json.load(f)
                except Exception as e:
                    self.log(f"Failed to load {filename}: {e}")
                    continue

            for item_id, item_data in items_data.items():
                locales = item_data.get("locales", {})
                for lang, values in locales.items():
                    locale_path = os.path.join(self.locales_dir, f"{lang}.json")
                    if os.path.exists(locale_path):
                        with open(locale_path, "r", encoding="utf-8") as f:
                            try:
                                locale_data = json.load(f)
                            except Exception:
                                self.log(f"Corrupted locale file: {locale_path}")
                                locale_data = {}
                    else:
                        locale_data = {}
                        self.log(f"Creating new locale file: {locale_path}")

                    changes = 0
                    for key_type in ["name", "shortName", "description"]:
                        loc_key = f"{item_id} {key_type.capitalize()}"
                        new_value = values.get(key_type)
                        if new_value is None:
                            continue

                        if loc_key not in locale_data:
                            locale_data[loc_key] = new_value
                            self.log(f"[{lang}] Added: {loc_key}")
                            stats["created"] += 1
                            changes += 1
                        elif locale_data[loc_key] != new_value:
                            locale_data[loc_key] = new_value
                            self.log(f"[{lang}] Updated: {loc_key}")
                            stats["updated"] += 1
                            changes += 1
                        else:
                            stats["skipped"] += 1

                    if changes > 0:
                        with open(locale_path, "w", encoding="utf-8") as f:
                            json.dump(locale_data, f, ensure_ascii=False, indent=2)

        self.log("--- Sync Complete ---")
        self.log(f"Created: {stats['created']}")
        self.log(f"Updated: {stats['updated']}")
        self.log(f"Skipped (unchanged): {stats['skipped']}")

if __name__ == "__main__":
    app = LocaleSyncApp()
    app.mainloop()
