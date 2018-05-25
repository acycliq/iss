import copy
import numpy as np
import pandas as pd
import logging


logger = logging.getLogger()
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s:%(levelname)s:%(message)s"
    )

class Base(object):
    def get_attr(self):
        return [a for a in dir(self) if not a.startswith('__') and not callable(getattr(self, a))]

    def _carve_out(self, IDs, flag):
        a = self.get_attr()
        dc = copy.deepcopy(self)
        if flag == 'Genes':
            self._carve_out_genes(dc, IDs)
        elif flag == 'Cells':
            self._carve_out_cells(dc, IDs)
        else:
            print('I shouldnt be here')
        return dc

    def _carve_out_genes(self, dc, IDs):
        dc.GeneExp_df = dc.GeneExp_df.loc[IDs, :]
        id_matched = np.isin(IDs, self.GeneName)
        if ~id_matched.all():
            unmatched = IDs[~id_matched]
            if len(unmatched) == 1:
                msg = "The ID: %s is missing from GeneNames" % unmatched
            else:
                msg = "These IDs: %s are missing from GeneNames" % unmatched
            logger.info(msg)

    def _carve_out_cells(self, dc, IDs):
        if np.issubdtype(np.array(IDs).dtype, np.number):
            dc._GeneExp = dc.GeneExp_df.iloc[:, IDs].values
        elif np.issubdtype(np.array(IDs).dtype, np.bool):
            dc._GeneExp = dc.GeneExp_df.iloc[:, IDs].values
        else:
            dc._GeneExp = dc.GeneExp_df[IDs].values
