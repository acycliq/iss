import json
import os
import src.utils as utils

my_path = os.path.abspath(os.path.dirname(__file__))
from pprint import pprint


def populate():
    config_file = os.path.join(my_path, "../data/json/iss_config.json")
    with open(config_file) as f:
        out = json.load(f)

    out["TileFiles"] = utils.parse_mat_array("TileFiles")


    return out
