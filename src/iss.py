import json
import os
import glob
import src.utils as utils
import logging


logger = logging.getLogger()
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s:%(levelname)s:%(message)s"
    )

my_path = os.path.abspath(os.path.dirname(__file__))


def populate():
    config_file = os.path.join(my_path, "../data/json/iss_config.json")
    with open(config_file) as f:
        out = json.load(f)

    mat_folder = os.path.join(my_path, "../data/mat")
    for file in os.listdir(mat_folder):
        if file.endswith(".mat"):
            path_str = os.path.join(mat_folder, file)
            key = os.path.splitext(file)[0]
            temp = utils.loadmat(path_str)
            msg = " Populating %s" % key
            logger.info(msg)
            out[key] = temp[key]

    # utils.loadmat(filename)
    # out["TileFiles"] = utils.parse_mat_array("TileFiles")
    # out["cSpotColors"] = utils.parse_mat_array("cSpotColors")

    return out
