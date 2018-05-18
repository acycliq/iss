import os
import src.utils as utils
import logging


logger = logging.getLogger()
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s:%(levelname)s:%(message)s"
    )


class GeneSet:
    def __init__(self):
        my_path = os.path.abspath(os.path.dirname(__file__))
        self._populate(os.path.join(my_path, "../data/GeneSet.mat"))

    def _populate(self, path_str):
        mat = utils.loadmat(path_str)
        dictionary = mat["GeneSet"]
        for key in mat["GeneSet"]:
            setattr(self, key, dictionary[key])


