import numpy as np
import os
import src.utils as utils
from skimage.measure import regionprops
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

    def filter_spots(self):
        out = dict()
        exclude_genes = ['Vsnl1', 'Atp1b1', 'Slc24a2', 'Tmsb10', 'Calm2', 'Gap43', 'Fxyd6']
        all_gene_names = self.GeneNames[self.SpotCodeNo-1] # -1 is needed because Matlab is 1-based
        cond_1 = ~np.isin(all_gene_names, exclude_genes)
        cond_2 = utils.inpolygon(self.SpotGlobalYX[:, 0], self.SpotGlobalYX[:, 1], self.CellCallRegionYX[:, 0], self.CellCallRegionYX[:, 1])
        cond_3 = self.quality_threshold()

        include_spot = cond_1 & cond_2 & cond_3
        SpotYX = self.SpotGlobalYX[include_spot, :].round()
        SpotGeneName = all_gene_names[include_spot]

        out["SpotXY"] = SpotYX
        out["SpotGeneName"] = SpotGeneName

        return out
        #
        #
        # y0 = self.CellCallRegionYX[:, 0].min()
        # x0 = self.CellCallRegionYX[:, 1].min()
        # y1 = self.CellCallRegionYX[:, 0].max()
        # x1 = self.CellCallRegionYX[:, 1].max()

    def cell_info(self):
        '''
        Read image and calc some statistics
        :return:
        '''
        out = dict()
        y0 = self.CellCallRegionYX[:, 0].min()
        x0 = self.CellCallRegionYX[:, 1].min()

        rp = regionprops(self.cell_map)
        CellYX = np.array([x.centroid for x in rp]) + np.array([y0, x0])

        CellArea0 = np.array([x.area for x in rp])
        MeanCellRadius = np.mean(np.sqrt(CellArea0 / np.pi)) * 0.5;

        RelCellRadius = np.sqrt(CellArea0 / np.pi) / MeanCellRadius
        np.append(RelCellRadius, 1)

        out["MeanCellRadius"] = MeanCellRadius
        out["RelCellRadius"] = RelCellRadius

        return out


    def call_cells(self):
        print("todo")

    def quality_threshold(self):
        qual_ok = self.SpotCombi & (self.SpotScore > self.CombiQualThresh) & (self.SpotIntensity > self.CombiIntensityThresh);

        anchors_ok = np.ones(qual_ok.shape)
        is_greater = self.cAnchorIntensities > self.DetectionThresh
        tot = is_greater.sum(axis=1)
        idx = tot > self.CombiAnchorsReq

        anchors_ok[np.array(self.SpotCombi, dtype=bool)] = idx
        qual_ok = np.array(qual_ok, dtype=bool) & np.array(anchors_ok, dtype=bool)
        nCombiCodes = np.array([x != 'EXTRA' for x in self.CharCodes]).sum()

        for i in range(self.ExtraCodes.shape[0]):
            my_spots = self.SpotCodeNo == nCombiCodes + (i+1)
            my_spots = np.array(my_spots, dtype=bool)
            thres = self.ExtraCodes[i, 3]
            is_above_thres = self.SpotIntensity[my_spots] > thres
            qual_ok[my_spots] = is_above_thres

        return qual_ok





