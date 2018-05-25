import os
import numpy as np
import pandas as pd
import src.utils as utils
import src.common
import copy
import logging


logger = logging.getLogger()
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s:%(levelname)s:%(message)s"
    )


class GeneSet(src.common.Base):
    def __init__(self):
        my_path = os.path.abspath(os.path.dirname(__file__))
        self._populate(os.path.join(my_path, "../data/GeneSet.mat"))
        self.GeneExp_df = pd.DataFrame(self._GeneExp, columns=self._CellName, index=self._GeneName)

    @property
    def GeneExp(self):
        return self.GeneExp_df.values

    @property
    def GeneName(self):
        return self.GeneExp_df.index.values

    @property
    def CellName(self):
        return self.GeneExp_df.columns.values

    @property
    def nGenes(self):
        return len(self.GeneName)

    @property
    def nCells(self):
        return len(self.CellName)

    @property
    def Class(self):
        return self._Class

    @property
    def CellInfo(self):
        return self._CellInfo

    def _populate(self, path_str):
        mat = utils.loadmat(path_str)
        dictionary = mat["GeneSet"]
        for key in mat["GeneSet"]:
            str_key = "_"+key
            setattr(self, str_key, dictionary[key])

    def GeneSubset(self, IDs):
        return self._carve_out(IDs, 'Genes')

    def CellSubset(self, IDs):
        return self._carve_out(IDs, 'Cells')

    # def CellSubset(self, cells):
    #     if np.issubdtype(cells.dtype, np.number):
    #
    #     norm = np.mean(self.GeneExp)

    def ScaleCell(self, p, q=1):
        func_1 = lambda x: x ** q
        func_2 = lambda x: x.mean(axis=0)
        func_3 = lambda x: x ** (1 / q)

        Norm = self.GeneExp_df.apply(func_1).apply(func_2).apply(func_3)
        Not0Norm = Norm.values > 0
        h = self.CellSubset(Not0Norm)
        v = Norm[Not0Norm] ** p
        h._GeneExp = h._GeneExp/v[None, :]
        sq = self.GeneExp**q
        hq = h.GeneExp**q
        scale_fac = sq.sum().sum() / hq.sum().sum()
        scale_fac = scale_fac ** (1/q)
        h._GeneExp = h._GeneExp * scale_fac
        return h

if __name__ == "__main__":
    g = GeneSet()
    GeneNames = ['3110035E14Rik',	'6330403K07Rik',	'Adgrl2',	'Aldoc',	'Arpp21',	'Bcl11b',	'Cadps2',	'Calb1',	'Calb2',	'Cck',	'Cdh13',	'Chodl',	'Chrm2',	'Cnr1',	'Col25a1',	'Cort',	'Cox6a2',	'Cplx2',	'Cpne5',	'Crh',	'Crhbp',	'Cryab',	'Crym',	'Cux2',	'Cxcl14',	'Enc1',	'Enpp2',	'Fam19a1',	'Fos',	'Gabrd',	'Gad1',	'Gda',	'Grin3a',	'Hapln1',	'Htr3a',	'Id2',	'Kcnk2',	'Kctd12',	'Kit',	'Lamp5',	'Lhx6',	'Ndnf',	'Neurod6',	'Nos1',	'Nov',	'Npy',	'Npy2r',	'Nr4a2',	'Nrn1',	'Nrsn1',	'Ntng1',	'Pax6',	'Pcp4',	'Pde1a',	'Penk',	'Plcxd2',	'Plp1',	'Pnoc',	'Prkca',	'Pthlh',	'Pvalb',	'Pvrl3',	'Qrfpr',	'Rab3c',	'Rasgrf2',	'Rbp4',	'Reln',	'Rgs10',	'Rgs12',	'Rgs4',	'Rorb',	'Rprm',	'Satb1',	'Scg2',	'Sema3c',	'Serpini1',	'Slc17a8',	'Slc6a1',	'Snca',	'Sncg',	'Sst',	'Sulf2',	'Synpr',	'Tac1',	'Tac2',	'Th',	'Thsd7a',	'Trp53i11',	'Vip',	'Wfs1',	'Yjefn3',	'Zcchc12']
    gSub = g.GeneSubSet(GeneNames)
    gSub.ScaleCell(0)