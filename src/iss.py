import numpy as np
import os
import src.utils as utils
import logging


logger = logging.getLogger()
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s:%(levelname)s:%(message)s"
    )


class Iss:
    def __init__(self):
        my_path = os.path.abspath(os.path.dirname(__file__))
        self._populate(os.path.join(my_path, "../data/iss.mat"))
        self._load_cellMapFile()
        print(self.cell_map)

    def _populate(self, path_str):
        mat = utils.loadmat(path_str)
        dictionary = mat["iss"]
        for key in mat["iss"]:
            setattr(self, key, dictionary[key])

    def _load_cellMapFile(self):
        mat = utils.loadmat(self.CellMapFile)
        self.cell_map = mat["CellMap"]

    def clean_data(self):
        exclude_genes = ['Vsnl1', 'Atp1b1', 'Slc24a2', 'Tmsb10', 'Calm2', 'Gap43', 'Fxyd6']
        all_gene_names = self.GeneNames[self.SpotCodeNo]
        cond_1 = ~np.isin(all_gene_names, exclude_genes)
        cond_2 = utils.inpolygon(self.SpotGlobalYX[:, 0], self.SpotGlobalYX[:, 1], self.CellCallRegionYX[:, 0], self.CellCallRegionYX[:, 1])

    def call_cells(self):
        print("todo")
