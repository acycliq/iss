import os
import numpy as np
import src.utils as utils
import copy
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

    def GeneSubSet(self, IDs):
        ss = copy.deepcopy(self)
        mask = np.isin(self.GeneName, IDs)
        ss.GeneExp = self.GeneExp[mask, :]
        ss.GeneName = self.GeneName[mask]
        ss.nGenes = len(IDs)

        # check if an ID is not in GeneName
        id_matched = np.isin(IDs, self.GeneName)
        if ~id_matched.all():
            unmatched = IDs[~id_matched]
            if len(unmatched) == 1:
                msg = "The ID: %s is missing from GeneNames" % unmatched
            else:
                msg = "These IDs: %s are missing from GeneNames" % unmatched

            logger.info(msg)

        return ss

    def ScaleCell(self, g, p, q):
        norm = np.mean(self.GeneExp)



