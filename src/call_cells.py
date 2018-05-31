import numpy as np
import pandas as pd
import os
import src.utils as utils
from src.iss import Iss
from src.geneset import GeneSet
from skimage.measure import regionprops
from sklearn.neighbors import NearestNeighbors
import logging


logger = logging.getLogger()
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s:%(levelname)s:%(message)s"
    )


class Call_cells:
    def __init__(self):
        #create iss and gSet objects and add them as propertie
        self._iss = Iss()
        self._gSet = GeneSet()
        self._CellYX = None
        self._MeanCellRadius = None
        self._RelCellRadius = None
        self._SpotYX = None
        self._SpotGeneName = None
        self._GeneNames = None
        self._SpotGeneNo = None
        self._TotGeneSpots = None
        self._ClassNames  = None


    @property
    def iss(self):
        return self._iss

    @property
    def gSet(self):
        return self._gSet

    @property
    def SpotGeneName(self):
        return self._SpotGeneName

    @property
    def SpotYX(self):
        return self._SpotYX

    @property
    def CellYX(self):
        return self._CellYX

    @property
    def MeanCellRadius(self):
        return self._MeanCellRadius

    @property
    def RelCellRadius(self):
        return self._RelCellRadius

    @property
    def GeneNames(self):
        return self._GeneNames

    @property
    def SpotGeneNo(self):
        return self._SpotGeneNo

    @property
    def TotGeneSpots(self):
        return self._TotGeneSpots

    @property
    def ClassNames(self):
        return self._ClassNames

    def run(self):
        self.preprocess()

    def preprocess(self):
        (self._SpotYX, self._SpotGeneName) = self._filter_spots()
        (self._CellYX, self._MeanCellRadius, self._RelCellRadius) = self._cell_info()
        (self._GeneNames, self._SpotGeneNo, self._TotGeneSpots, self._ClassNames) = self._initialise()

    @utils.cached('filter_spots_cache.pickle')
    def _filter_spots(self):
        exclude_genes = ['Vsnl1', 'Atp1b1', 'Slc24a2', 'Tmsb10', 'Calm2', 'Gap43', 'Fxyd6']
        all_gene_names = self.iss.GeneNames[self.iss.SpotCodeNo-1] # -1 is needed because Matlab is 1-based
        cond_1 = ~np.isin(all_gene_names, exclude_genes)
        cond_2 = utils.inpolygon(self.iss.SpotGlobalYX[:, 0], self.iss.SpotGlobalYX[:, 1], self.iss.CellCallRegionYX[:, 0], self.iss.CellCallRegionYX[:, 1])
        cond_3 = self._quality_threshold()

        include_spot = cond_1 & cond_2 & cond_3
        SpotYX = self.iss.SpotGlobalYX[include_spot, :].round()
        SpotGeneName = all_gene_names[include_spot]

        return SpotYX, SpotGeneName

    def _quality_threshold(self):
        qual_ok = self.iss.SpotCombi & (self.iss.SpotScore > self.iss.CombiQualThresh) & (self.iss.SpotIntensity > self.iss.CombiIntensityThresh);

        anchors_ok = np.ones(qual_ok.shape)
        is_greater = self.iss.cAnchorIntensities > self.iss.DetectionThresh
        tot = is_greater.sum(axis=1)
        idx = tot > self.iss.CombiAnchorsReq

        anchors_ok[np.array(self.iss.SpotCombi, dtype=bool)] = idx
        qual_ok = np.array(qual_ok, dtype=bool) & np.array(anchors_ok, dtype=bool)
        nCombiCodes = np.array([x != 'EXTRA' for x in self.iss.CharCodes]).sum()

        for i in range(self.iss.ExtraCodes.shape[0]):
            my_spots = self.iss.SpotCodeNo == nCombiCodes + (i+1)
            my_spots = np.array(my_spots, dtype=bool)
            thres = self.iss.ExtraCodes[i, 3]
            is_above_thres = self.iss.SpotIntensity[my_spots] > thres
            qual_ok[my_spots] = is_above_thres

        return qual_ok

    @utils.cached('cell_info_cache.pickle')
    def _cell_info(self):
        '''
        Read image and calc some statistics
        :return:
        '''
        y0 = self.iss.CellCallRegionYX[:, 0].min()
        x0 = self.iss.CellCallRegionYX[:, 1].min()

        mat = utils.loadmat(self.iss.CellMapFile)
        rp = regionprops(mat["CellMap"])
        CellYX = np.array([x.centroid for x in rp]) + np.array([y0, x0])

        CellArea0 = np.array([x.area for x in rp])
        MeanCellRadius = np.mean(np.sqrt(CellArea0 / np.pi)) * 0.5;

        RelCellRadius = np.sqrt(CellArea0 / np.pi) / MeanCellRadius
        np.append(RelCellRadius, 1)

        return CellYX, MeanCellRadius, RelCellRadius

    def _initialise(self):
        [GeneNames, SpotGeneNo, TotGeneSpots] = np.unique(self.SpotGeneName, return_inverse=True, return_counts=True)
        ClassNames = np.append(pd.unique(self.gSet.Class), 'Zero')

        nG = GeneNames.shape[0]
        nK = ClassNames.shape[0]
        nC = self.CellYX.shape[0] + 1
        nS = self.SpotYX.shape[0]
        nN = self.iss.nNeighbors + 1

        ClassPrior = np.append([.5 * np.ones(nK - 1) / nK], 0.5);

        MeanClassExp = np.nan * np.ones([nK, nG])
        temp = self.gSet.GeneSubset(GeneNames).ScaleCell(0)
        for k in range(nK-1):
            print(k)
            print(ClassNames[k])
            val = self.iss.Inefficiency * np.mean(temp.CellSubset(ClassNames[k]).GeneExp, 1);
            MeanClassExp[k, :] = val

        lMeanClassExp = np.log(MeanClassExp + self.iss.SpotReg)
        nbrs = NearestNeighbors(n_neighbors=nK, algorithm='ball_tree').fit(self.CellYX)
        distances, indices = nbrs.kneighbors(self.SpotYX)

        return GeneNames, SpotGeneNo, TotGeneSpots, ClassNames






if __name__ == "__main__":
    cl = Call_cells()
    cl.run()
    print("done")