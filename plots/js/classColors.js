

function classColors()
{
    var out = [

        {className: 'Cck.Calca', nick: 'Cck',r: 1, g: 0, b:0},
        {className: 'Cck.Cxcl14.Calb1.Igfbp5', nick: 'CckCxcl14',r: 1, g: 0, b:0},
        {className: 'Cck.Cxcl14.Calb1.Kctd12', nick: 'CckCxcl14',r: 1, g: 0, b:0},
        {className: 'Cck.Cxcl14.Calb1.Tac2', nick: 'CckCxcl14',r: 1, g: 0, b:0},
        {className: 'Cck.Cxcl14.Calb1.Tnfaip8l3', nick: 'CckCxcl14',r: 1, g: 0, b:0},
        {className: 'Cck.Cxcl14.Slc17a8', nick: 'CckCxcl14Slc17a8',r: 1, g: 0, b:0},
        {className: 'Cck.Cxcl14.Vip', nick: 'CckCxcl14Vip',r: 1, g: 0, b:0},
        {className: 'Cck.Lmo1.Npy', nick: 'CckVip',r: 1, g: 0, b:0},
        {className: 'Cck.Lmo1.Vip.Crh', nick: 'CckVip',r: 1, g: 0, b:0},
        {className: 'Cck.Lmo1.Vip.Fam19a2', nick: 'CckVip',r: 1, g: 0, b:0},
        {className: 'Cck.Lmo1.Vip.Tac2', nick: 'CckVip',r: 1, g: 0, b:0},
        {className: 'Cck.Lypd1', nick: 'Cck',r: 1, g: 0, b:0},
        {className: 'Cck.Sema5a', nick: 'Cck',r: 1, g: 0, b:0},
        {className: 'Cacna2d1.Lhx6.Reln', nick: 'MGENGF',r: 1, g: 0, b:0.9},
        {className: 'Cacna2d1.Lhx6.Vwa5a', nick: 'Ivy',r: 1, g: 0, b:0.9},
        {className: 'Cacna2d1.Ndnf.Cxcl14', nick: 'CGENGF',r: 1, g: 0, b:0.9},
        {className: 'Cacna2d1.Ndnf.Npy', nick: 'CGENGF',r: 1, g: 0, b:0.9},
        {className: 'Cacna2d1.Ndnf.Rgs10', nick: 'CGENGF',r: 1, g: 0, b:0.9},
        {className: 'Astro.1', nick: 'NonNeuron',r: 1, g: 1, b:1},
        {className: 'Astro.2', nick: 'NonNeuron',r: 1, g: 1, b:1},
        {className: 'Astro.3', nick: 'NonNeuron',r: 1, g: 1, b:1},
        {className: 'Astro.4', nick: 'NonNeuron',r: 1, g: 1, b:1},
        {className: 'Astro.5', nick: 'NonNeuron',r: 1, g: 1, b:1},
        {className: 'Choroid', nick: 'NonNeuron',r: 1, g: 1, b:1},
        {className: 'Endo', nick: 'NonNeuron',r: 1, g: 1, b:1},
        {className: 'Eryth.1', nick: 'NonNeuron',r: 1, g: 1, b:1},
        {className: 'Eryth.2', nick: 'NonNeuron',r: 1, g: 1, b:1},
        {className: 'Microglia.1', nick: 'NonNeuron',r: 1, g: 1, b:1},
        {className: 'Microglia.2', nick: 'NonNeuron',r: 1, g: 1, b:1},
        {className: 'Oligo.1', nick: 'NonNeuron',r: 1, g: 1, b:1},
        {className: 'Oligo.2', nick: 'NonNeuron',r: 1, g: 1, b:1},
        {className: 'Oligo.3', nick: 'NonNeuron',r: 1, g: 1, b:1},
        {className: 'Oligo.4', nick: 'NonNeuron',r: 1, g: 1, b:1},
        {className: 'Oligo.5', nick: 'NonNeuron',r: 1, g: 1, b:1},
        {className: 'Vsmc', nick: 'NonNeuron',r: 1, g: 1, b:1},
        {className: 'PC.CA1.1', nick: 'PC',r: 0, g: 1, b:0},
        {className: 'PC.CA1.2', nick: 'PC',r: 0, g: 1, b:0},
        {className: 'PC.CA1.3', nick: 'PC',r: 0, g: 1, b:0},
        {className: 'PC.CA2', nick: 'PCCA2',r: 0.45, g: 0.9, b:0},
        {className: 'PC.CA3', nick: 'PCCA3',r: 0.45, g: 0.9, b:0},
        {className: 'Ntng1.Chrm2', nick: 'Trilaminar',r: 1, g: 0.5, b:0},
        {className: 'Ntng1.Rgs10', nick: 'Radretrohip',r: 1, g: 0.5, b:0},
        {className: 'Ntng1.Synpr', nick: 'Proj',r: 1, g: 0.5, b:0},
        {className: 'Pvalb.C1ql1.Cpne5', nick: 'AAC',r: 0.359999999999999, g: 0.2, b:1},
        {className: 'Pvalb.C1ql1.Npy', nick: 'AAC',r: 0.359999999999999, g: 0.2, b:1},
        {className: 'Pvalb.C1ql1.Pvalb', nick: 'AAC',r: 0.359999999999999, g: 0.2, b:1},
        {className: 'Pvalb.Tac1.Akr1c18', nick: 'BC',r: 0.359999999999999, g: 0.2, b:1},
        {className: 'Pvalb.Tac1.Nr4a2', nick: 'BC',r: 0.359999999999999, g: 0.2, b:1},
        {className: 'Pvalb.Tac1.Sst', nick: 'BC',r: 0.359999999999999, g: 0.2, b:1},
        {className: 'Pvalb.Tac1.Syt2', nick: 'BC',r: 0.359999999999999, g: 0.2, b:1},
        {className: 'Sst.Cryab', nick: 'Sst',r: 0, g: 0.7, b:1},
        {className: 'Sst.Erbb4.Crh', nick: 'O-Bi',r: 0, g: 0.7, b:1},
        {className: 'Sst.Erbb4.Rgs10', nick: 'O-Bi',r: 0, g: 0.7, b:1},
        {className: 'Sst.Erbb4.Th', nick: 'O-Bi',r: 0, g: 0.7, b:1},
        {className: 'Sst.Nos1', nick: 'Nos1',r: 0, g: 0.7, b:1},
        {className: 'Sst.Npy.Cort', nick: 'HSept',r: 0, g: 0.7, b:1},
        {className: 'Sst.Npy.Mgat4c', nick: 'HSept',r: 0, g: 0.7, b:1},
        {className: 'Sst.Npy.Serpine2', nick: 'HSept',r: 0, g: 0.7, b:1},
        {className: 'Sst.Npy.Zbtb20', nick: 'HSept',r: 0, g: 0.7, b:1},
        {className: 'Sst.Pnoc.Calb1.Igfbp5', nick: 'OLM',r: 0, g: 0.7, b:1},
        {className: 'Sst.Pnoc.Calb1.Pvalb', nick: 'OLM',r: 0, g: 0.7, b:1},
        {className: 'Sst.Pnoc.Pvalb', nick: 'OLM',r: 0, g: 0.7, b:1},
        {className: 'Calb2.Cntnap5a.Igfbp6', nick: 'IS1',r: 1, g: 0.9, b:0},
        {className: 'Calb2.Cntnap5a.Rspo3', nick: 'IS1',r: 1, g: 0.9, b:0},
        {className: 'Calb2.Cntnap5a.Vip', nick: 'IS1',r: 1, g: 0.9, b:0},
        {className: 'Calb2.Cryab', nick: 'IS1',r: 1, g: 0.9, b:0},
        {className: 'Calb2.Vip.Gpd1', nick: 'IS3',r: 1, g: 0.9, b:0},
        {className: 'Calb2.Vip.Igfbp4', nick: 'IS3',r: 1, g: 0.9, b:0},
        {className: 'Calb2.Vip.Nos1', nick: 'IS3',r: 1, g: 0.9, b:0},
        {className: 'Vip.Crh.C1ql1', nick: 'IS2',r: 1, g: 0.9, b:0},
        {className: 'Vip.Crh.Pcp4', nick: 'CckCxcl14Vip',r: 1, g: 0.9, b:0},
        {className: 'Zero', nick: 'Zero',r: 0, g: 0, b:0},



    ];

    return out
}