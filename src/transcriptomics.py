import pandas as pd
import numpy as np

def getNames(n):
    fName = "./data/yob2017.txt"
    df = pd.read_csv(fName,  names=["Name", "Sex", "Counts"])
    return np.random.permutation(df.Counts)[:n]


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
