import pkgutil
import importlib
import os

package_name = __package__


# Get the directory of the current package
package_dir = os.path.dirname(__file__)

# Iterate over all modules in the package and import them dynamically
for _, module_name, _ in pkgutil.iter_modules([package_dir]):
    full_module_name = f"{package_name}.{module_name}"
    print(f"Importing {full_module_name}")  # Debugging

    module = importlib.import_module(full_module_name)  # ✅ Use dynamically created module name
    globals()[module_name] = module  # Optionally add to globals()
