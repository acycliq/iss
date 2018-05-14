import pandas as pd
import numpy as np


class Geneset:
    def __init__(self, filename, nheader_lines):
        self._GeneExp = pd.read_csv(filename, sep='\t', header=0, index_col=0)
        self._nGenes = self.GeneExp.shape[0]
        self._GeneName = self.GeneExp.index.values

    @property
    def GeneExp(self):
        return self._GeneExp

    @property
    def nGenes(self):
        return self._nGenes

    @property
    def groupby(self):
        return self._groupby

    @property
    def cluster_map(self):
        return self._cluster_map

    @property
    def par(self):
        return self._par