import React, { useState, useEffect, useRef } from "react";
import { ScanSetup } from "../types";
import {
  Button,
  Fieldset,
  Field,
  Input,
  Label,
  Select,
} from "@headlessui/react";
import { loadERPStockCount, deleteERPStockCount } from "../utils/opfsUtils";
import { toast } from "react-hot-toast";

// Interface for location data
interface LocationData {
  type: string;
  location: string;
}

// Predefined location data
const LOCATION_DATA: LocationData[] = [
  { type: "MM", location: "MM001" },
  { type: "MM", location: "MMCON" },
  { type: "MM", location: "MMDIS" },
  { type: "MM", location: "MMPER" },
  { type: "MM", location: "MMSET" },
  { type: "CON", location: "CBE0001F01" },
  { type: "CON", location: "CBE0001L01" },
  { type: "CON", location: "CBE0001L02" },
  { type: "ZLOAN", location: "AAAAAMM002" },
  { type: "ZLOAN", location: "AAAAAMM003" },
  { type: "ZLOAN", location: "AACONMM003" },
  { type: "ZLOAN", location: "ACIFEXW1I1" },
  { type: "ZLOAN", location: "ACIFEXW2I2" },
  { type: "ZLOAN", location: "ACIFEXW3I3" },
  { type: "MLOAN", location: "ACIFOSCL01" },
  { type: "MLOAN", location: "ACIFOSCL02" },
  { type: "MLOAN", location: "ACIFOSCML1" },
  { type: "MLOAN", location: "ACIFOSCSL1" },
  { type: "MLOAN", location: "ACIFOSCSL2" },
  { type: "ZLOAN", location: "ACIFOSFUI2" },
  { type: "ZLOAN", location: "ACIFSVALI1" },
  { type: "ZLOAN", location: "ACIFTSCI01" },
  { type: "ZLOAN", location: "ACIFTSCI04" },
  { type: "ZLOAN", location: "ACIFTSCI06" },
  { type: "ZLOAN", location: "ACIFTSCI07" },
  { type: "ZLOAN", location: "ACIFTSCI09" },
  { type: "ZLOAN", location: "ADEORMOTI1" },
  { type: "ZLOAN", location: "ADEORMOTI2" },
  { type: "MLOAN", location: "ADEORMOTL1" },
  { type: "MLOAN", location: "ADEORMOTL2" },
  { type: "MLOAN", location: "ALFST2WL01" },
  { type: "MLOAN", location: "ALIFDREL01" },
  { type: "MLOAN", location: "ALIFDREL02" },
  { type: "MLOAN", location: "ALIFDRLRG1" },
  { type: "ZLOAN", location: "ALIFEXTI01" },
  { type: "ZLOAN", location: "ALIFEXTI02" },
  { type: "ZLOAN", location: "ALIFEXTI03" },
  { type: "ZLOAN", location: "ALIFIMW2I2" },
  { type: "ZLOAN", location: "ALIFRETRI1" },
  { type: "ZLOAN", location: "ALIFRETRI2" },
  { type: "ZLOAN", location: "ALIFSETI01" },
  { type: "ZLOAN", location: "ALIFSETI03" },
  { type: "MLOAN", location: "ALIFSETL01" },
  { type: "MLOAN", location: "ALIFSETL03" },
  { type: "MLOAN", location: "ALIFSMLL01" },
  { type: "MLOAN", location: "ANTMXPFL01" },
  { type: "MLOAN", location: "APEXDLFL01" },
  { type: "MLOAN", location: "APEXFENL01" },
  { type: "ZLOAN", location: "APOGEECUI1" },
  { type: "MLOAN", location: "APXCMNTL01" },
  { type: "MLOAN", location: "ARIESSTL01" },
  { type: "MLOAN", location: "ARIESSTL02" },
  { type: "MLOAN", location: "ARIESSTL03" },
  { type: "MLOAN", location: "AUGUSTAUTO" },
  { type: "ZLOAN", location: "BIPOCUPI01" },
  { type: "MLOAN", location: "BIPOCUPL01" },
  { type: "MLOAN", location: "CADISKNOL1" },
  { type: "MLOAN", location: "CADISSML01" },
  { type: "MLOAN", location: "CADISSML02" },
  { type: "MLOAN", location: "CADISSML03" },
  { type: "MLOAN", location: "CADISSML05" },
  { type: "ZLOAN", location: "CADISSRI01" },
  { type: "ZLOAN", location: "CADISSRI02" },
  { type: "ZLOAN", location: "CADISSRI03" },
  { type: "ZLOAN", location: "CADISSRI04" },
  { type: "ZLOAN", location: "CADISSRI05" },
  { type: "MLOAN", location: "CAS0BLIL01" },
  { type: "MLOAN", location: "CASCADCL01" },
  { type: "MLOAN", location: "CASCADCL02" },
  { type: "MLOAN", location: "CASCADCL03" },
  { type: "MLOAN", location: "CASCPLIF01" },
  { type: "MLOAN", location: "CASCPLIF02" },
  { type: "MLOAN", location: "CASOBLIL01" },
  { type: "MLOAN", location: "CASPARSET1" },
  { type: "MLOAN", location: "CASPARSET2" },
  { type: "MLOAN", location: "CASPLF85S1" },
  { type: "MLOAN", location: "CASPLNOL01" },
  { type: "MLOAN", location: "CASPLPZL01" },
  { type: "MLOAN", location: "CASTLIFL01" },
  { type: "MLOAN", location: "CASXLIFI01" },
  { type: "MLOAN", location: "CASXLIFL01" },
  { type: "ZLOAN", location: "CBE0001L1L" },
  { type: "CON", location: "CBE0002F01" },
  { type: "CON", location: "CBE0002L01" },
  { type: "CON", location: "CBE0002L02" },
  { type: "CON", location: "CBE0002L03" },
  { type: "CON", location: "CBE0002L04" },
  { type: "CON", location: "CBE0002L05" },
  { type: "ZLOAN", location: "CBE0002L1L" },
  { type: "ZLOAN", location: "CBE0002L2L" },
  { type: "CON", location: "CBE0003F01" },
  { type: "CON", location: "CBE0003L01" },
  { type: "ZLOAN", location: "CBE0003L1L" },
  { type: "CON", location: "CBE0005F01" },
  { type: "CON", location: "CBE0005L01" },
  { type: "ZLOAN", location: "CBE0005L1L" },
  { type: "CON", location: "CBE0006F01" },
  { type: "CON", location: "CBE0006L01" },
  { type: "CON", location: "CBE0006L02" },
  { type: "CON", location: "CBE0006L03" },
  { type: "CON", location: "CBE0006L04" },
  { type: "ZLOAN", location: "CBE0006L1L" },
  { type: "ZLOAN", location: "CBE0006L2L" },
  { type: "ZLOAN", location: "CBE0006L3L" },
  { type: "ZLOAN", location: "CBE0006L4L" },
  { type: "CON", location: "CBE0007F01" },
  { type: "ZLOAN", location: "CBE0007L1L" },
  { type: "CON", location: "CBE0008F01" },
  { type: "CON", location: "CBE0008L01" },
  { type: "ZLOAN", location: "CBE0008L1L" },
  { type: "CON", location: "CBE0009F01" },
  { type: "CON", location: "CBE0009L01" },
  { type: "ZLOAN", location: "CBE0009L1L" },
  { type: "CON", location: "CBE0010F01" },
  { type: "CON", location: "CBE0010L01" },
  { type: "ZLOAN", location: "CBE0010L1L" },
  { type: "CON", location: "CBE0011F01" },
  { type: "CON", location: "CBE0011L01" },
  { type: "CON", location: "CBE0011L02" },
  { type: "ZLOAN", location: "CBE0011L1L" },
  { type: "ZLOAN", location: "CBE0011L2L" },
  { type: "CON", location: "CBE0012F01" },
  { type: "CON", location: "CBE0012L01" },
  { type: "ZLOAN", location: "CBE0012L1L" },
  { type: "CON", location: "CBE0013F01" },
  { type: "CON", location: "CBE0013L01" },
  { type: "ZLOAN", location: "CBE0013L1L" },
  { type: "CON", location: "CBE0014F01" },
  { type: "CON", location: "CBE0014L01" },
  { type: "ZLOAN", location: "CBE0014L1L" },
  { type: "CON", location: "CBE0015F01" },
  { type: "CON", location: "CBE0015L01" },
  { type: "ZLOAN", location: "CBE0015L1L" },
  { type: "CON", location: "CBE0016F01" },
  { type: "ZLOAN", location: "CBE0016L1L" },
  { type: "CON", location: "CBE0017F01" },
  { type: "CON", location: "CBE0017L01" },
  { type: "ZLOAN", location: "CBE0017L1L" },
  { type: "CON", location: "CBE0018F01" },
  { type: "CON", location: "CBE0018L01" },
  { type: "ZLOAN", location: "CBE0018L1L" },
  { type: "CON", location: "CBE0019F01" },
  { type: "CON", location: "CBE0019L02" },
  { type: "ZLOAN", location: "CBE0019L2L" },
  { type: "CON", location: "CBE0020F01" },
  { type: "ZLOAN", location: "CBE0020L01" },
  { type: "ZLOAN", location: "CBE0020L1L" },
  { type: "CON", location: "CBE0021F01" },
  { type: "CON", location: "CBE0021L01" },
  { type: "CON", location: "CBE0021L02" },
  { type: "ZLOAN", location: "CBE0021L1L" },
  { type: "ZLOAN", location: "CBE0021L2L" },
  { type: "CON", location: "CBE0022F01" },
  { type: "ZLOAN", location: "CBE0022L1L" },
  { type: "CON", location: "CBE0023F01" },
  { type: "CON", location: "CBE0023L01" },
  { type: "ZLOAN", location: "CBE0023L1L" },
  { type: "CON", location: "CBE0024F01" },
  { type: "CON", location: "CBE0024L01" },
  { type: "ZLOAN", location: "CBE0024L1L" },
  { type: "CON", location: "CBE0025F01" },
  { type: "ZLOAN", location: "CBE0025L1L" },
  { type: "CON", location: "CBE0026F01" },
  { type: "CON", location: "CBE0026L01" },
  { type: "ZLOAN", location: "CBE0026L1L" },
  { type: "CON", location: "CBE0027F01" },
  { type: "ZLOAN", location: "CBE0027L1L" },
  { type: "CON", location: "CBE0029F01" },
  { type: "CON", location: "CBE0029L01" },
  { type: "ZLOAN", location: "CBE0029L1L" },
  { type: "CON", location: "CBE0031F01" },
  { type: "ZLOAN", location: "CBE0031L1L" },
  { type: "CON", location: "CBE0032F01" },
  { type: "CON", location: "CBE0032L01" },
  { type: "ZLOAN", location: "CBE0032L1L" },
  { type: "CON", location: "CBE0033F01" },
  { type: "CON", location: "CBE0033L01" },
  { type: "ZLOAN", location: "CBE0033L1L" },
  { type: "CON", location: "CBE0034F01" },
  { type: "CON", location: "CBE0034L01" },
  { type: "ZLOAN", location: "CBE0034L1L" },
  { type: "CON", location: "CBE0035F01" },
  { type: "CON", location: "CBE0035L01" },
  { type: "ZLOAN", location: "CBE0035L1L" },
  { type: "CON", location: "CBE0036F01" },
  { type: "CON", location: "CBE0036L01" },
  { type: "ZLOAN", location: "CBE0036L1L" },
  { type: "CON", location: "CBE0037F01" },
  { type: "CON", location: "CBE0037L01" },
  { type: "ZLOAN", location: "CBE0037L1L" },
  { type: "CON", location: "CBE0038F01" },
  { type: "ZLOAN", location: "CBE0038L1L" },
  { type: "CON", location: "CBE0039F01" },
  { type: "CON", location: "CBE0039L01" },
  { type: "ZLOAN", location: "CBE0039L1L" },
  { type: "CON", location: "CBE0040F01" },
  { type: "CON", location: "CBE0040L01" },
  { type: "ZLOAN", location: "CBE0040L1L" },
  { type: "CON", location: "CBE0041F01" },
  { type: "CON", location: "CBE0041L01" },
  { type: "ZLOAN", location: "CBE0041L1L" },
  { type: "CON", location: "CBE0042F01" },
  { type: "CON", location: "CBE0042L01" },
  { type: "ZLOAN", location: "CBE0042L1L" },
  { type: "CON", location: "CBE0043F01" },
  { type: "CON", location: "CBE0043L01" },
  { type: "ZLOAN", location: "CBE0043L1L" },
  { type: "CON", location: "CBE0044F01" },
  { type: "CON", location: "CBE0044L01" },
  { type: "CON", location: "CBE0044L02" },
  { type: "CON", location: "CBE0044L03" },
  { type: "ZLOAN", location: "CBE0044L1L" },
  { type: "ZLOAN", location: "CBE0044L2L" },
  { type: "ZLOAN", location: "CBE0044L3L" },
  { type: "CON", location: "CBE0045F01" },
  { type: "CON", location: "CBE0045L01" },
  { type: "ZLOAN", location: "CBE0045L1L" },
  { type: "CON", location: "CBE0046F01" },
  { type: "CON", location: "CBE0046L01" },
  { type: "ZLOAN", location: "CBE0046L1L" },
  { type: "CON", location: "CBE0047F01" },
  { type: "CON", location: "CBE0047L01" },
  { type: "ZLOAN", location: "CBE0047L1L" },
  { type: "CON", location: "CBE0048F01" },
  { type: "CON", location: "CBE0048L01" },
  { type: "ZLOAN", location: "CBE0048L1L" },
  { type: "CON", location: "CBE0049F01" },
  { type: "CON", location: "CBE0049L01" },
  { type: "ZLOAN", location: "CBE0049L1L" },
  { type: "CON", location: "CBE0050F01" },
  { type: "CON", location: "CBE0050L01" },
  { type: "ZLOAN", location: "CBE0050L1L" },
  { type: "CON", location: "CBE0051F01" },
  { type: "CON", location: "CBE0051L01" },
  { type: "ZLOAN", location: "CBE0051L1L" },
  { type: "CON", location: "CBE0052F01" },
  { type: "CON", location: "CBE0052L01" },
  { type: "CON", location: "CBE0052L02" },
  { type: "ZLOAN", location: "CBE0052L1L" },
  { type: "ZLOAN", location: "CBE0052L2L" },
  { type: "CON", location: "CBE0053F01" },
  { type: "CON", location: "CBE0053L01" },
  { type: "ZLOAN", location: "CBE0053L1L" },
  { type: "CON", location: "CBE0054F01" },
  { type: "CON", location: "CBE0054L01" },
  { type: "ZLOAN", location: "CBE0054L1L" },
  { type: "CON", location: "CBE0055F01" },
  { type: "CON", location: "CBE0055L01" },
  { type: "ZLOAN", location: "CBE0055L1L" },
  { type: "CON", location: "CBE0056F01" },
  { type: "CON", location: "CBE0056L01" },
  { type: "ZLOAN", location: "CBE0056L1L" },
  { type: "CON", location: "CBE0057F01" },
  { type: "CON", location: "CBE0057L01" },
  { type: "ZLOAN", location: "CBE0057L1L" },
  { type: "CON", location: "CBE0058F01" },
  { type: "CON", location: "CBE0058L01" },
  { type: "CON", location: "CBE0058L02" },
  { type: "ZLOAN", location: "CBE0058L1L" },
  { type: "ZLOAN", location: "CBE0058L2L" },
  { type: "CON", location: "CBE0059F01" },
  { type: "CON", location: "CBE0059L01" },
  { type: "CON", location: "CBE0059L02" },
  { type: "ZLOAN", location: "CBE0059L1L" },
  { type: "CON", location: "CBE0060F01" },
  { type: "CON", location: "CBE0060L01" },
  { type: "ZLOAN", location: "CBE0060L1L" },
  { type: "CON", location: "CBE0061F01" },
  { type: "CON", location: "CBE0061L01" },
  { type: "ZLOAN", location: "CBE0061L1L" },
  { type: "CON", location: "CBE0062F01" },
  { type: "CON", location: "CBE0062L01" },
  { type: "ZLOAN", location: "CBE0062L1L" },
  { type: "CON", location: "CBE0063F01" },
  { type: "CON", location: "CBE0063L01" },
  { type: "ZLOAN", location: "CBE0063L1L" },
  { type: "CON", location: "CBE0064F01" },
  { type: "CON", location: "CBE0064L01" },
  { type: "ZLOAN", location: "CBE0064L1L" },
  { type: "CON", location: "CBE0065F01" },
  { type: "ZLOAN", location: "CBE0065L1L" },
  { type: "CON", location: "CBE0066F01" },
  { type: "CON", location: "CBE0066L01" },
  { type: "ZLOAN", location: "CBE0066L1L" },
  { type: "CON", location: "CBE0067F01" },
  { type: "CON", location: "CBE0067L01" },
  { type: "ZLOAN", location: "CBE0067L1L" },
  { type: "CON", location: "CBE0068F01" },
  { type: "CON", location: "CBE0068L01" },
  { type: "CON", location: "CBE0068L02" },
  { type: "ZLOAN", location: "CBE0068L1L" },
  { type: "ZLOAN", location: "CBE0068L2L" },
  { type: "CON", location: "CBE0069F01" },
  { type: "CON", location: "CBE0069L01" },
  { type: "ZLOAN", location: "CBE0069L1L" },
  { type: "CON", location: "CBE0070F01" },
  { type: "ZLOAN", location: "CBE0070L1L" },
  { type: "CON", location: "CBE0071F01" },
  { type: "CON", location: "CBE0071L01" },
  { type: "ZLOAN", location: "CBE0071L1L" },
  { type: "CON", location: "CBE0072F01" },
  { type: "ZLOAN", location: "CBE0072L1L" },
  { type: "CON", location: "CBE0073F01" },
  { type: "ZLOAN", location: "CBE0073L1L" },
  { type: "CON", location: "CBE0074F01" },
  { type: "ZLOAN", location: "CBE0074L1L" },
  { type: "CON", location: "CBE0075F01" },
  { type: "ZLOAN", location: "CBE0075L1L" },
  { type: "CON", location: "CBE0076F01" },
  { type: "ZLOAN", location: "CBE0076L1L" },
  { type: "CON", location: "CBE0077F01" },
  { type: "ZLOAN", location: "CBE0077L1L" },
  { type: "CON", location: "CBE0078F01" },
  { type: "CON", location: "CBE0078L01" },
  { type: "ZLOAN", location: "CBE0078L1L" },
  { type: "CON", location: "CBE0079F01" },
  { type: "CON", location: "CBE0079L01" },
  { type: "ZLOAN", location: "CBE0079L1L" },
  { type: "CON", location: "CBE0080F01" },
  { type: "ZLOAN", location: "CBE0080L1L" },
  { type: "CON", location: "CBE0081F01" },
  { type: "ZLOAN", location: "CBE0081L1L" },
  { type: "CON", location: "CBE0083L01" },
  { type: "ZLOAN", location: "CBE0083L1L" },
  { type: "CON", location: "CBE0091F01" },
  { type: "ZLOAN", location: "CBE0091L1L" },
  { type: "CON", location: "CBE0092F01" },
  { type: "CON", location: "CBE0092L01" },
  { type: "ZLOAN", location: "CBE0092L1L" },
  { type: "CON", location: "CBE0093F01" },
  { type: "CON", location: "CBE0093L01" },
  { type: "CON", location: "CBE0095F01" },
  { type: "CON", location: "CBE0095L01" },
  { type: "ZLOAN", location: "CBE0095L1L" },
  { type: "CON", location: "CBE0096F01" },
  { type: "CON", location: "CBE0096L01" },
  { type: "ZLOAN", location: "CBE0096L1L" },
  { type: "CON", location: "CBE0098F01" },
  { type: "CON", location: "CBE0098L01" },
  { type: "ZLOAN", location: "CBE0098L1L" },
  { type: "CON", location: "CBE0099F01" },
  { type: "CON", location: "CBE0099L01" },
  { type: "ZLOAN", location: "CBE0099L1L" },
  { type: "CON", location: "CBE0100L01" },
  { type: "CON", location: "CBE0101L01" },
  { type: "CON", location: "CBE0104L01" },
  { type: "ZLOAN", location: "CBE0104L1L" },
  { type: "CON", location: "CBE0105L01" },
  { type: "ZLOAN", location: "CBE0105L1L" },
  { type: "CON", location: "CBE0107L01" },
  { type: "ZLOAN", location: "CBE0107L1L" },
  { type: "CON", location: "CBE0108L01" },
  { type: "CON", location: "CBE0108L1L" },
  { type: "CON", location: "CBE0110L01" },
  { type: "ZLOAN", location: "CBE0110L1L" },
  { type: "CON", location: "CBE0111F01" },
  { type: "CON", location: "CBE0111L01" },
  { type: "CON", location: "CBE0111L02" },
  { type: "ZLOAN", location: "CBE0111L1L" },
  { type: "ZLOAN", location: "CBE0111L2L" },
  { type: "CON", location: "CBE0112F01" },
  { type: "CON", location: "CBE0112L01" },
  { type: "ZLOAN", location: "CBE0112L1L" },
  { type: "CON", location: "CBE0120L01" },
  { type: "CON", location: "CBE0122L01" },
  { type: "CON", location: "CBE0124L01" },
  { type: "CON", location: "CBE0125L01" },
  { type: "MLOAN", location: "CBE0127L01" },
  { type: "MLOAN", location: "CCH0082L01" },
  { type: "CON", location: "CCH0083F01" },
  { type: "CON", location: "CCH0083L01" },
  { type: "ZLOAN", location: "CCH0083L1L" },
  { type: "MLOAN", location: "CDE0087F01" },
  { type: "CON", location: "CDE0087L01" },
  { type: "ZLOAN", location: "CELECARI01" },
  { type: "ZLOAN", location: "CELLENTI01" },
  { type: "ZLOAN", location: "CELLENTI02" },
  { type: "ZLOAN", location: "CELLENTI03" },
  { type: "ZLOAN", location: "CELLENTI04" },
  { type: "MLOAN", location: "CELLENTL01" },
  { type: "MLOAN", location: "CELLENTL02" },
  { type: "MLOAN", location: "CELLENTL03" },
  { type: "MLOAN", location: "CELLENTL04" },
  { type: "MLOAN", location: "CELLENTXL1" },
  { type: "MLOAN", location: "CELLILIL01" },
  { type: "MLOAN", location: "CELLILIL02" },
  { type: "ZLOAN", location: "CELLREVI01" },
  { type: "MLOAN", location: "CELLREVL01" },
  { type: "MLOAN", location: "CELLREVL02" },
  { type: "MLOAN", location: "CHESANTL01" },
  { type: "ZLOAN", location: "COLIPLTLI1" },
  { type: "ZLOAN", location: "COLIPLTLI2" },
  { type: "MLOAN", location: "COLPLCML01" },
  { type: "ZLOAN", location: "COLPLCSI01" },
  { type: "ZLOAN", location: "COLPLCSI02" },
  { type: "ZLOAN", location: "COLPLCSI03" },
  { type: "MLOAN", location: "COLPLCSL01" },
  { type: "MLOAN", location: "COLPLCSL02" },
  { type: "MLOAN", location: "COLPLCSL03" },
  { type: "ZLOAN", location: "COLPLF9I01" },
  { type: "MLOAN", location: "COLPLF9L01" },
  { type: "MLOAN", location: "COLPLTFL01" },
  { type: "MLOAN", location: "COLPLTFL02" },
  { type: "MLOAN", location: "COLWEIKL01" },
  { type: "CON", location: "CPT0088L01" },
  { type: "ZLOAN", location: "DCRTRIALI1" },
  { type: "MLOAN", location: "DEMOGRIP01" },
  { type: "MLOAN", location: "DEMOGRIP02" },
  { type: "MLOAN", location: "DEMOMATERI" },
  { type: "MLOAN", location: "DEMOSLICKS" },
  { type: "ZLOAN", location: "DISCECTI01" },
  { type: "MLOAN", location: "DIVA3DCIN1" },
  { type: "MLOAN", location: "DIVA3DCIN2" },
  { type: "MLOAN", location: "DIVA3DCIN3" },
  { type: "MLOAN", location: "DIVA3DCIN4" },
  { type: "ZLOAN", location: "DIVAACTTI1" },
  { type: "MLOAN", location: "DIVALLFL01" },
  { type: "ZLOAN", location: "DIVAPEEKI1" },
  { type: "MLOAN", location: "DIVAPEEKL1" },
  { type: "MLOAN", location: "DRSPROGL01" },
  { type: "MLOAN", location: "DRSPROGL02" },
  { type: "MLOAN", location: "DRSRODSL01" },
  { type: "MLOAN", location: "DRSRODSL02" },
  { type: "MLOAN", location: "DRSRODSL03" },
  { type: "MLOAN", location: "DRSRODSL04" },
  { type: "MLOAN", location: "DRSRODSL05" },
  { type: "MLOAN", location: "DRSRODSL06" },
  { type: "MLOAN", location: "DRSRODXL01" },
  { type: "ZLOAN", location: "DUMMYKAAT1" },
  { type: "ZLOAN", location: "DUMMYNATH1" },
  { type: "ZLOAN", location: "DUMMYZOE01" },
  { type: "MLOAN", location: "DV3DCERIS1" },
  { type: "MLOAN", location: "DV3DCIS1IS" },
  { type: "ZLOAN", location: "DYNARODI01" },
  { type: "ZLOAN", location: "DYNARODI02" },
  { type: "ZLOAN", location: "DYNARODI03" },
  { type: "ZLOAN", location: "DYNARODI04" },
  { type: "MLOAN", location: "DYNARODL01" },
  { type: "MLOAN", location: "DYNARODL02" },
  { type: "MLOAN", location: "DYNARODL03" },
  { type: "MLOAN", location: "DYNARODL04" },
  { type: "MLOAN", location: "ELBACAGL01" },
  { type: "MLOAN", location: "ES2IMPLSH2" },
  { type: "MLOAN", location: "ES2MONOPC1" },
  { type: "MLOAN", location: "ES2MONOPC2" },
  { type: "MLOAN", location: "ES2POLY001" },
  { type: "MLOAN", location: "ES2POLY002" },
  { type: "MLOAN", location: "EVCOMUS2IS" },
  { type: "MLOAN", location: "EVEBAMI3IS" },
  { type: "MLOAN", location: "EVECOM95IS" },
  { type: "MLOAN", location: "EVEDEFS1IS" },
  { type: "MLOAN", location: "EVEFULSI01" },
  { type: "MLOAN", location: "EVERBASET4" },
  { type: "MLOAN", location: "EVERBASI01" },
  { type: "MLOAN", location: "EVERBASI02" },
  { type: "MLOAN", location: "EVERDEFL01" },
  { type: "MLOAN", location: "EVERDEFL02" },
  { type: "MLOAN", location: "EVERSXTL01" },
  { type: "MLOAN", location: "EVEUNISET1" },
  { type: "MLOAN", location: "EVEUNISET2" },
  { type: "MLOAN", location: "EVOSREVL01" },
  { type: "ZLOAN", location: "EVOSSETI01" },
  { type: "ZLOAN", location: "EVOSSETI02" },
  { type: "MLOAN", location: "EVOSSETL01" },
  { type: "MLOAN", location: "EVOSSETL02" },
  { type: "ZLOAN", location: "EXTRACURI1" },
  { type: "MLOAN", location: "FILLCOLL01" },
  { type: "ZLOAN", location: "FLEXILII01" },
  { type: "MLOAN", location: "FLEXILIL01" },
  { type: "ZLOAN", location: "FLEXLYSI01" },
  { type: "MLOAN", location: "FLEXLYSL01" },
  { type: "MLOAN", location: "FLEXREVL01" },
  { type: "MLOAN", location: "FLEXSTAI02" },
  { type: "ZLOAN", location: "FLEXSTAI03" },
  { type: "MLOAN", location: "FLEXSTAL01" },
  { type: "MLOAN", location: "FLEXSTAL02" },
  { type: "MLOAN", location: "FLEXSTAL03" },
  { type: "MLOAN", location: "GETSETSL01" },
  { type: "MLOAN", location: "GRIPLYSL01" },
  { type: "MLOAN", location: "GRIPP6ML01" },
  { type: "MLOAN", location: "GRIPP6ML02" },
  { type: "MLOAN", location: "GRIPP6ML03" },
  { type: "MLOAN", location: "GRIPP6ML04" },
  { type: "MLOAN", location: "GRIPP6ML05" },
  { type: "MLOAN", location: "GRIPP6ML06" },
  { type: "MLOAN", location: "GRIPP6ML07" },
  { type: "MLOAN", location: "GRIPP6ML08" },
  { type: "MLOAN", location: "GRIPP6ML09" },
  { type: "MLOAN", location: "GRIPP6ML10" },
  { type: "ZLOAN", location: "GRIPPCONI1" },
  { type: "MLOAN", location: "GRIPPCONL1" },
  { type: "ZLOAN", location: "GRIPPINS01" },
  { type: "ZLOAN", location: "GRIPPINS02" },
  { type: "ZLOAN", location: "GRIPPINS03" },
  { type: "ZLOAN", location: "GRIPPINS04" },
  { type: "ZLOAN", location: "GRIPPINS05" },
  { type: "ZLOAN", location: "GRIPPINS06" },
  { type: "ZLOAN", location: "GRIPPINS07" },
  { type: "ZLOAN", location: "GRIPPINS08" },
  { type: "ZLOAN", location: "GRIPREVI01" },
  { type: "ZLOAN", location: "GRIPREVI02" },
  { type: "ZLOAN", location: "GRIPREVI03" },
  { type: "ZLOAN", location: "GRIPREVI04" },
  { type: "ZLOAN", location: "GRIPREVI05" },
  { type: "MLOAN", location: "GRIPREVL01" },
  { type: "MLOAN", location: "GRIPREVL02" },
  { type: "MLOAN", location: "GRIPREVL03" },
  { type: "MLOAN", location: "GRIPREVL04" },
  { type: "MLOAN", location: "GRIPREVL05" },
  { type: "ZLOAN", location: "GSSHOOKI01" },
  { type: "ZLOAN", location: "GSSHOOKI02" },
  { type: "ZLOAN", location: "GSSHOOKI03" },
  { type: "MLOAN", location: "GSSHOOKL01" },
  { type: "MLOAN", location: "GSSHOOKL02" },
  { type: "MLOAN", location: "GSSHOOKL03" },
  { type: "MLOAN", location: "HANJOSEL01" },
  { type: "MLOAN", location: "HERA6MML01" },
  { type: "MLOAN", location: "HERA6MML02" },
  { type: "MLOAN", location: "HERA6MML03" },
  { type: "MLOAN", location: "JADESHAUTO" },
  { type: "MLOAN", location: "JENSVEAUTO" },
  { type: "CON", location: "JLTEST0001" },
  { type: "MLOAN", location: "JOIMAXSL02" },
  { type: "MLOAN", location: "KAAPVERD01" },
  { type: "MLOAN", location: "KEVINGAUTO" },
  { type: "ZLOAN", location: "KOROLEFLO1" },
  { type: "ZLOAN", location: "KOROSECI02" },
  { type: "ZLOAN", location: "KOROSECI03" },
  { type: "ZLOAN", location: "KOROSECI05" },
  { type: "ZLOAN", location: "KOROSECIW1" },
  { type: "ZLOAN", location: "LEFLOTEXI1" },
  { type: "ZLOAN", location: "LEFLOTEXI2" },
  { type: "ZLOAN", location: "LEFLOTEXI3" },
  { type: "ZLOAN", location: "LONGCURI01" },
  { type: "MLOAN", location: "LOUISLAUTO" },
  { type: "ZLOAN", location: "M6LECARI01" },
  { type: "ZLOAN", location: "MATRISCI01" },
  { type: "ZLOAN", location: "MATRISCI02" },
  { type: "ZLOAN", location: "MATRISCI03" },
  { type: "ZLOAN", location: "MATRISCI04" },
  { type: "ZLOAN", location: "MATRISCI05" },
  { type: "MLOAN", location: "MATRISCL01" },
  { type: "MLOAN", location: "MATRISCL02" },
  { type: "MLOAN", location: "MATRISCL03" },
  { type: "MLOAN", location: "MATRISCL04" },
  { type: "MLOAN", location: "MATRISCL05" },
  { type: "MLOAN", location: "MATRISCL06" },
  { type: "MLOAN", location: "MATRISCL07" },
  { type: "MLOAN", location: "MATRISCL08" },
  { type: "ZLOAN", location: "MATRISDI01" },
  { type: "ZLOAN", location: "MATRISDI02" },
  { type: "MLOAN", location: "MATRISDL01" },
  { type: "MLOAN", location: "MATRISDL02" },
  { type: "MLOAN", location: "MIDLI20L01" },
  { type: "MLOAN", location: "MIDLINEL01" },
  { type: "MLOAN", location: "MIDLINEL02" },
  { type: "MLOAN", location: "MIDLINEL03" },
  { type: "MLOAN", location: "OASYSCRL01" },
  { type: "MLOAN", location: "ORTHOBION1" },
  { type: "ZLOAN", location: "ORTHOBPLI1" },
  { type: "ZLOAN", location: "ORTHOBPLI2" },
  { type: "ZLOAN", location: "ORTHOBPLI3" },
  { type: "ZLOAN", location: "ORTHOBTLI1" },
  { type: "ZLOAN", location: "ORTHOBTLI3" },
  { type: "ZLOAN", location: "ORTHOBTLI4" },
  { type: "ZLOAN", location: "ORTLFK2MI3" },
  { type: "MLOAN", location: "PANREAPL01" },
  { type: "ZLOAN", location: "PASSTULI01" },
  { type: "MLOAN", location: "PERSEUSL01" },
  { type: "ZLOAN", location: "PLIFCOMI01" },
  { type: "MLOAN", location: "PLIFCOML01" },
  { type: "MLOAN", location: "PRDSCNVL01" },
  { type: "MLOAN", location: "PRDSCNVL02" },
  { type: "MLOAN", location: "PRDSCNVL03" },
  { type: "MLOAN", location: "PRDSCNVL04" },
  { type: "MLOAN", location: "PRDSCNVL05" },
  { type: "MLOAN", location: "PRDSCNVL06" },
  { type: "MLOAN", location: "PRDSCVVL01" },
  { type: "MLOAN", location: "PRDSCVVL02" },
  { type: "MLOAN", location: "PRDSCVVL03" },
  { type: "MLOAN", location: "PRDSCVVL04" },
  { type: "MLOAN", location: "PRDSCVVL05" },
  { type: "MLOAN", location: "PRDSCVVL06" },
  { type: "MLOAN", location: "PRODISCL01" },
  { type: "MLOAN", location: "PRODISCL02" },
  { type: "ZLOAN", location: "PRODLEXI01" },
  { type: "ZLOAN", location: "PRODLEXI02" },
  { type: "ZLOAN", location: "PROTOWERI1" },
  { type: "MLOAN", location: "PTLIF25L04" },
  { type: "MLOAN", location: "PYRBASEI01" },
  { type: "MLOAN", location: "PYRBASEL01" },
  { type: "MLOAN", location: "PYREN45L01" },
  { type: "MM", location: "REAUT" },
  { type: "MM", location: "RECEN" },
  { type: "MLOAN", location: "REFHYBRL01" },
  { type: "MM", location: "REFIN" },
  { type: "MM", location: "RENOV" },
  { type: "MM", location: "REORT" },
  { type: "MM", location: "RESTR" },
  { type: "MLOAN", location: "RETTSUNAMI" },
  { type: "ZLOAN", location: "REXCERVI04" },
  { type: "MLOAN", location: "REXCERVL01" },
  { type: "MLOAN", location: "REXCERVL02" },
  { type: "MLOAN", location: "REXCERVL03" },
  { type: "MLOAN", location: "REXCERVL04" },
  { type: "MLOAN", location: "REXCERVL05" },
  { type: "MLOAN", location: "REXCERVL06" },
  { type: "MLOAN", location: "REXFIXDL01" },
  { type: "ZLOAN", location: "REXHOOKI01" },
  { type: "MLOAN", location: "REXHOOKL01" },
  { type: "MLOAN", location: "REXIOREVL1" },
  { type: "ZLOAN", location: "REXIOUSI02" },
  { type: "ZLOAN", location: "REXIOUSI03" },
  { type: "ZLOAN", location: "REXIOUSI04" },
  { type: "MLOAN", location: "REXIOUSL01" },
  { type: "MLOAN", location: "REXIOUSL02" },
  { type: "MLOAN", location: "REXIOUSL03" },
  { type: "MLOAN", location: "REXSPNLL01" },
  { type: "ZLOAN", location: "RODCUTTI01" },
  { type: "ZLOAN", location: "SANTISNI01" },
  { type: "MLOAN", location: "SCOREVOL01" },
  { type: "CON", location: "SDE0001L01" },
  { type: "CON", location: "SDE0004L01" },
  { type: "ZLOAN", location: "SHAVECURI1" },
  { type: "ZLOAN", location: "SKYCOCTI01" },
  { type: "MLOAN", location: "SKYCOCTL01" },
  { type: "MLOAN", location: "SLICKLYS01" },
  { type: "ZLOAN", location: "SLICKSIN01" },
  { type: "MLOAN", location: "SLICKSPL01" },
  { type: "MLOAN", location: "SLICKSPL02" },
  { type: "MLOAN", location: "SLICKSPL03" },
  { type: "ZLOAN", location: "SOCOCERI01" },
  { type: "MLOAN", location: "SOCOCERL01" },
  { type: "ZLOAN", location: "SOCOREMI01" },
  { type: "ZLOAN", location: "SOCOREMI02" },
  { type: "MLOAN", location: "SOCOREML01" },
  { type: "MLOAN", location: "SOCOREML02" },
  { type: "ZLOAN", location: "SOCOREOI01" },
  { type: "ZLOAN", location: "SOCOREOI02" },
  { type: "ZLOAN", location: "SOCOREOI04" },
  { type: "MLOAN", location: "SOCOREOL01" },
  { type: "MLOAN", location: "SOCOREOL02" },
  { type: "MLOAN", location: "SOCOREOL04" },
  { type: "MLOAN", location: "SOCOSRTL01" },
  { type: "MLOAN", location: "SOCOSRTL02" },
  { type: "MLOAN", location: "SOCREVOL01" },
  { type: "MLOAN", location: "SOCREVOL02" },
  { type: "MLOAN", location: "SOLSTICL01" },
  { type: "MLOAN", location: "SPIDERSL01" },
  { type: "MLOAN", location: "SPIDERSL02" },
  { type: "MLOAN", location: "SPIDERXL01" },
  { type: "ZLOAN", location: "STALIFCI01" },
  { type: "ZLOAN", location: "STALIFCI02" },
  { type: "ZLOAN", location: "STALIFCI03" },
  { type: "MLOAN", location: "STALIFLS01" },
  { type: "MLOAN", location: "STALIFLS02" },
  { type: "MLOAN", location: "STALIFLS03" },
  { type: "MLOAN", location: "STALIFLS04" },
  { type: "MLOAN", location: "STALIFLS07" },
  { type: "MLOAN", location: "STALIFLS08" },
  { type: "MLOAN", location: "STEVENAUTO" },
  { type: "MLOAN", location: "STLF12ML05" },
  { type: "MLOAN", location: "STLF12ML06" },
  { type: "MLOAN", location: "TAURUSTL01" },
  { type: "ZLOAN", location: "TERNOVAI01" },
  { type: "ZLOAN", location: "TERNOVAI02" },
  { type: "ZLOAN", location: "TERNOVAI03" },
  { type: "MLOAN", location: "TOMBOGAUTO" },
  { type: "ZLOAN", location: "TRABISIS01" },
  { type: "ZLOAN", location: "TRABISIS02" },
  { type: "MLOAN", location: "TRABISLS01" },
  { type: "MLOAN", location: "TRABISLS02" },
  { type: "MLOAN", location: "TRABISLS03" },
  { type: "ZLOAN", location: "TRABISMI01" },
  { type: "MLOAN", location: "TRABISML01" },
  { type: "MLOAN", location: "TRABISXL01" },
  { type: "MLOAN", location: "TRABISXL02" },
  { type: "ZLOAN", location: "TRABISXLI1" },
  { type: "MLOAN", location: "TRABSXLL01" },
  { type: "MLOAN", location: "TRABSXLL02" },
  { type: "ZLOAN", location: "TRIPOD5I01" },
  { type: "ZLOAN", location: "TRIPOD5I02" },
  { type: "ZLOAN", location: "TRIPOD5I03" },
  { type: "ZLOAN", location: "TRIPOD5I04" },
  { type: "ZLOAN", location: "TRIPOD5I05" },
  { type: "MLOAN", location: "TRIPOD5L01" },
  { type: "MLOAN", location: "TRIPOD5L02" },
  { type: "MLOAN", location: "TRIPOD5L03" },
  { type: "MLOAN", location: "TRIPOD5L04" },
  { type: "MLOAN", location: "TRIPOD5L05" },
  { type: "MLOAN", location: "TRIPOD5L06" },
  { type: "MLOAN", location: "TRITANCI01" },
  { type: "MLOAN", location: "TRITANCI02" },
  { type: "MLOAN", location: "TRITANCI03" },
  { type: "MLOAN", location: "TRITANPL01" },
  { type: "MLOAN", location: "TRITANPL02" },
  { type: "MLOAN", location: "TRITANTL01" },
  { type: "MLOAN", location: "TRITANTL02" },
  { type: "MLOAN", location: "TSCACFLRG2" },
  { type: "MLOAN", location: "TSCACIFL01" },
  { type: "MLOAN", location: "TSCACIFL03" },
  { type: "MLOAN", location: "TSCACIFL04" },
  { type: "MLOAN", location: "TSCACIFL05" },
  { type: "MLOAN", location: "TSCACIFL06" },
  { type: "MLOAN", location: "TSCACIFL07" },
  { type: "MLOAN", location: "TSCACIFL08" },
  { type: "MLOAN", location: "TSCACIFL09" },
  { type: "MLOAN", location: "TSCACIFL10" },
  { type: "MLOAN", location: "TSCACIFLRG" },
  { type: "ZLOAN", location: "TSCPLIFI01" },
  { type: "ZLOAN", location: "TSCPLIFI02" },
  { type: "ZLOAN", location: "TSCPLIFI03" },
  { type: "ZLOAN", location: "TSCPLIFI06" },
  { type: "MLOAN", location: "TSCPLIFL01" },
  { type: "MLOAN", location: "TSCPLIFL02" },
  { type: "MLOAN", location: "TSCPLIFL03" },
  { type: "MLOAN", location: "TSCPLIFL04" },
  { type: "MLOAN", location: "TSCPLIFL05" },
  { type: "MLOAN", location: "TSCPLIFL06" },
  { type: "MLOAN", location: "TSCPLIFL07" },
  { type: "MLOAN", location: "TSCPLIFL08" },
  { type: "MLOAN", location: "TSCPLIFL09" },
  { type: "MLOAN", location: "TSCPLIFL10" },
  { type: "MLOAN", location: "TSCPLIFL11" },
  { type: "MLOAN", location: "TSCPLIFL12" },
  { type: "MLOAN", location: "TSCPLIFL13" },
  { type: "ZLOAN", location: "TSCPLIFRI1" },
  { type: "ZLOAN", location: "TSCPLIFRI2" },
  { type: "ZLOAN", location: "TSCPLIFRI3" },
  { type: "ZLOAN", location: "TSCPLIFRI4" },
  { type: "MLOAN", location: "TSCPTLFL01" },
  { type: "MLOAN", location: "TSCPTLFL02" },
  { type: "MLOAN", location: "TSCPTLFL03" },
  { type: "MLOAN", location: "TSCPTLFL04" },
  { type: "MLOAN", location: "TSCPTLFL05" },
  { type: "ZLOAN", location: "TSCTLIFI01" },
  { type: "MLOAN", location: "TSCTLIFL01" },
  { type: "MLOAN", location: "TSCTLIFL02" },
  { type: "MLOAN", location: "TSCTLIFL03" },
  { type: "MLOAN", location: "TSCTLIFL04" },
  { type: "MLOAN", location: "UNITYPLL01" },
  { type: "MLOAN", location: "URSUSDLL01" },
  { type: "MLOAN", location: "USPACERL01" },
  { type: "ZLOAN", location: "VBRCLSTI01" },
  { type: "MLOAN", location: "VBRCLSTL01" },
  { type: "MLOAN", location: "VELOXSTL01" },
  { type: "MLOAN", location: "VELOXSTL02" },
  { type: "MLOAN", location: "VELOXSTL03" },
  { type: "MLOAN", location: "VELOXSTL04" },
  { type: "MLOAN", location: "VELOXXLL01" },
  { type: "MLOAN", location: "VENTPLFL01" },
  { type: "MLOAN", location: "VENTPLIF01" },
  { type: "ZLOAN", location: "VOSBTWINI1" },
  { type: "ZLOAN", location: "VOSCROSI01" },
  { type: "ZLOAN", location: "VOSCROSI02" },
  { type: "ZLOAN", location: "VOSCROSI03" },
  { type: "ZLOAN", location: "VOSCTEKI01" },
  { type: "ZLOAN", location: "VOSCTEKI02" },
  { type: "ZLOAN", location: "VOSDSSEXI1" },
  { type: "ZLOAN", location: "VOSERENI02" },
  { type: "ZLOAN", location: "VOSEVOSI02" },
  { type: "ZLOAN", location: "VOSEVOSI03" },
  { type: "ZLOAN", location: "VOSEVOSI04" },
  { type: "ZLOAN", location: "VOSEVOSI05" },
  { type: "ZLOAN", location: "VOSFIREI01" },
  { type: "ZLOAN", location: "VOSFIXSI02" },
  { type: "ZLOAN", location: "VOSFLEX2I1" },
  { type: "ZLOAN", location: "VOSFLEX3I1" },
  { type: "ZLOAN", location: "VOSGLOBI01" },
  { type: "ZLOAN", location: "VOSGRIPI01" },
  { type: "ZLOAN", location: "VOSKRITI01" },
  { type: "ZLOAN", location: "VOSMAXIMI1" },
  { type: "ZLOAN", location: "VOSODALI01" },
  { type: "ZLOAN", location: "VOSOLASI01" },
  { type: "ZLOAN", location: "VOSOLASI02" },
  { type: "ZLOAN", location: "VOSOLASI03" },
  { type: "ZLOAN", location: "VOSOLASI04" },
  { type: "ZLOAN", location: "VOSOLASI05" },
  { type: "ZLOAN", location: "VOSOLSTI01" },
  { type: "ZLOAN", location: "VOSPASSI01" },
  { type: "ZLOAN", location: "VOSPASSI02" },
  { type: "ZLOAN", location: "VOSPASSI03" },
  { type: "ZLOAN", location: "VOSPASSI04" },
  { type: "ZLOAN", location: "VOSPASSI05" },
  { type: "ZLOAN", location: "VOSPCMLI01" },
  { type: "ZLOAN", location: "VOSPIDERI1" },
  { type: "ZLOAN", location: "VOSPIDERI2" },
  { type: "ZLOAN", location: "VOSPTULI01" },
  { type: "ZLOAN", location: "VOSQUANI01" },
  { type: "ZLOAN", location: "VOSREXMAI1" },
  { type: "ZLOAN", location: "VOSREXSI01" },
  { type: "ZLOAN", location: "VOSREXSI02" },
  { type: "ZLOAN", location: "VOSREXSI03" },
  { type: "ZLOAN", location: "VOSREXXI02" },
  { type: "ZLOAN", location: "VOSSANTI01" },
  { type: "ZLOAN", location: "VOSSANTI02" },
  { type: "ZLOAN", location: "VOSSONOI01" },
  { type: "ZLOAN", location: "VOSSTEFI01" },
  { type: "ZLOAN", location: "WALKEXTI01" },
  { type: "ZLOAN", location: "WALKEXTI02" },
  { type: "MLOAN", location: "XIA3DEFL01" },
  { type: "MLOAN", location: "XIA3DEFOS2" },
  { type: "MLOAN", location: "XIA3DEG3IS" },
  { type: "MLOAN", location: "XIA3DEGEN1" },
  { type: "MLOAN", location: "XIA3DEGES3" },
  { type: "MLOAN", location: "XIA3DEGI01" },
  { type: "MLOAN", location: "XIA3DEGL01" },
  { type: "MLOAN", location: "XIA45PD1IS" },
  { type: "MLOAN", location: "XIA45PD2IS" },
  { type: "MLOAN", location: "XIA45PEDS1" },
  { type: "MLOAN", location: "XIA45PEDS2" },
  { type: "MLOAN", location: "XIASCREWL0" },
  { type: "ZLOAN", location: "XTRACTLI01" },
  { type: "ZLOAN", location: "XTRACTLI02" },
  { type: "ZLOAN", location: "XTRACTSI01" },
  { type: "ZLOAN", location: "XTRACTSI02" },
  { type: "ZLOAN", location: "XTRACTSI03" },
  { type: "ZLOAN", location: "XTRACTSI04" },
  { type: "ZLOAN", location: "XTRACTSI05" },
  { type: "ZLOAN", location: "XTRACTSI06" },
  { type: "ZLOAN", location: "XTRACTSI07" },
  { type: "MLOAN", location: "YANATSAUTO" },
  { type: "MLOAN", location: "YVESMEAUTO" },
  { type: "MLOAN", location: "ZMEDLEEN01" },
  { type: "MLOAN", location: "ZMEDLEEN02" },
  { type: "MLOAN", location: "ZMEDLEEN05" },
  { type: "MLOAN", location: "ZMEDLEEN06" },
  { type: "MLOAN", location: "ZMEDLEEN07" },
  { type: "MLOAN", location: "ZMEDLEEN08" },
  { type: "ZLOAN", location: "ZMEDMISI01" },
];

interface SetupFormProps {
  onSetupComplete: (setupInfo: ScanSetup) => void;
  initialValues: ScanSetup;
}

const SetupForm: React.FC<SetupFormProps> = ({
  onSetupComplete,
  initialValues,
}) => {
  const [storageSite, setStorageSite] = useState(initialValues.storageSite);
  const [movementCode, setMovementCode] = useState(initialValues.movementCode);
  const [location, setLocation] = useState(initialValues.location);
  const [stockCount, setStockCount] = useState(initialValues.stockCount);
  const [addRefMode, setAddRefMode] = useState(initialValues.addRefMode);
  const [expiredTime, setExpiredTime] = useState(
    initialValues.expiredTime ?? 6,
  );
  const [customLocation, setCustomLocation] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [locationSearchTerm, setLocationSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get unique location types from the predefined data
  const locationTypes = [...new Set(LOCATION_DATA.map((loc) => loc.type))];
  const [selectedLocationType, setSelectedLocationType] = useState<string>(
    locationTypes.length > 0 ? locationTypes[0] : "",
  );
  const [filteredLocations, setFilteredLocations] = useState<string[]>([]);
  const [searchFilteredLocations, setSearchFilteredLocations] = useState<
    string[]
  >([]);

  // Filter locations when location type changes or search term changes
  useEffect(() => {
    if (selectedLocationType) {
      const typeFiltered = LOCATION_DATA.filter(
        (loc) => loc.type === selectedLocationType,
      ).map((loc) => loc.location);
      setFilteredLocations(typeFiltered);

      // Apply search filter if there's a search term
      if (locationSearchTerm) {
        const searchResults = typeFiltered.filter((loc) =>
          loc.toLowerCase().includes(locationSearchTerm.toLowerCase()),
        );
        setSearchFilteredLocations(searchResults);
      } else {
        setSearchFilteredLocations(typeFiltered);
      }

      // Reset location when type changes
      if (!customLocation) {
        setLocation("");
      }
    }
  }, [selectedLocationType, locationSearchTerm, customLocation]);

  // Effect to handle clicking outside the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsLocationDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSetupComplete({
      stockCount,
      storageSite,
      addRefMode,
      movementCode,
      location,
      expiredTime,
    });
  };

  const handleERPFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Delete existing ERP stock count before loading new one
      await deleteERPStockCount();
      const { stockCounts, allRefs } = await loadERPStockCount(file, location);

      if (stockCounts.length > 0) {
        toast.success(
          `ERP stock count loaded: ${stockCounts.length} items for location, ${allRefs.size} total REFs`,
        );
      } else {
        toast.error("Failed to load ERP stock count for this location");
        // Clear the input value to allow uploading the same file again
        e.target.value = "";
      }
    }
  };

  const handleMovementCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Replace spaces with underscores
    const value = e.target.value.replace(/\s/g, "_");
    setMovementCode(value);
  };

  const toggleCustomLocation = () => {
    setCustomLocation(!customLocation);
    if (!customLocation) {
      setLocation(""); // Clear location when switching to custom input
      setIsLocationDropdownOpen(false); // Close dropdown if open
    }
  };

  const handleSelectLocation = (selectedLocation: string) => {
    setLocation(selectedLocation);
    setIsLocationDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Scan Setup</h1>
          <form onSubmit={handleSubmit}>
            <Fieldset className="space-y-4">
              <Field>
                <Label className="block text-sm font-medium text-gray-700">
                  Scan Type
                </Label>

                <Select
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                  value={stockCount ? "true" : "false"}
                  onChange={(e) => setStockCount(e.target.value === "true")}
                >
                  <option value="true">Stock Count</option>
                  <option value="false">Stock Receipt</option>
                </Select>
              </Field>
              <Field className="hidden">
                <Label className="block text-sm font-medium text-gray-700">
                  Storage Site
                </Label>
                <Input
                  placeholder="Storage Site"
                  type="text"
                  value={storageSite}
                  onChange={(e) => setStorageSite(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                />
              </Field>
              <Field>
                <Label className="block text-sm font-medium text-gray-700">
                  Movement Code
                </Label>
                <Input
                  placeholder="Movement Code"
                  type="text"
                  value={movementCode}
                  onChange={handleMovementCodeChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                />
              </Field>

              {/* Location Type Row with Dropdown and Toggle */}
              <div className="flex flex-col space-y-2">
                <Label className="block text-sm font-medium text-gray-700">
                  Location Type
                </Label>
                <div className="flex items-center space-x-4">
                  <Select
                    className="flex-grow px-4 py-2 border border-gray-300 rounded-md"
                    value={selectedLocationType}
                    onChange={(e) => setSelectedLocationType(e.target.value)}
                    required
                  >
                    {locationTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Select>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="checkbox"
                      id="custom-location-toggle"
                      checked={customLocation}
                      onChange={toggleCustomLocation}
                      className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label
                      htmlFor="custom-location-toggle"
                      className="text-sm text-gray-700 whitespace-nowrap"
                    >
                      Custom location
                    </Label>
                  </div>
                </div>
              </div>

              {/* Searchable Location Dropdown (shown when not in custom mode) */}
              {!customLocation && filteredLocations.length > 0 && (
                <Field>
                  <Label className="block text-sm font-medium text-gray-700">
                    Location
                  </Label>
                  <div className="relative" ref={dropdownRef}>
                    {/* Display selected location or placeholder */}
                    <div
                      className="mt-1 flex items-center w-full px-4 py-2 border border-gray-300 rounded-md bg-white cursor-pointer"
                      onClick={() =>
                        setIsLocationDropdownOpen(!isLocationDropdownOpen)
                      }
                    >
                      <span
                        className={location ? "text-gray-900" : "text-gray-500"}
                      >
                        {location || "Select a location"}
                      </span>
                    </div>

                    {/* Dropdown panel */}
                    {isLocationDropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300 max-h-96 overflow-hidden">
                        {/* Search input */}
                        <div className="p-2 border-b border-gray-200">
                          <Input
                            type="text"
                            placeholder="Search locations..."
                            value={locationSearchTerm}
                            onChange={(e) =>
                              setLocationSearchTerm(e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            autoFocus
                          />
                        </div>

                        {/* Dropdown options */}
                        <div className="max-h-72 overflow-y-auto">
                          {searchFilteredLocations.length > 0 ? (
                            searchFilteredLocations.map((loc) => (
                              <div
                                key={loc}
                                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                                  location === loc
                                    ? "bg-blue-50 text-blue-600"
                                    : ""
                                }`}
                                onClick={() => handleSelectLocation(loc)}
                              >
                                {loc}
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-gray-500">
                              No locations found
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Field>
              )}

              {/* Manual Location Input (shown in custom mode or when no filtered locations available) */}
              {(customLocation || filteredLocations.length === 0) && (
                <Field>
                  <Label className="block text-sm font-medium text-gray-700">
                    Location
                  </Label>
                  <Input
                    placeholder="Location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </Field>
              )}

              <Field className="mb-4">
                <Label className="flex items-center space-x-2">
                  <Input
                    type="checkbox"
                    checked={addRefMode}
                    onChange={(e) => setAddRefMode(e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Enable REF input mode</span>
                </Label>
              </Field>
              <Field>
                <Label className="block text-sm font-medium text-gray-700">
                  Expiry Warning Time (months)
                </Label>
                <Input
                  placeholder="Months before expiry warning"
                  type="number"
                  min="0"
                  max="48"
                  value={expiredTime}
                  onChange={(e) => setExpiredTime(parseInt(e.target.value, 10))}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                />
                <span className="text-xs text-gray-500">
                  Products expiring within this many months will show a warning
                </span>
              </Field>

              {stockCount && (
                <Field>
                  <Label className="block text-sm font-medium text-gray-700">
                    ERP (Sage X3) Stock Count File
                  </Label>
                  <a
                    className="text-sm text-blue-600 underline underline-offset-2"
                    href="http://213.207.99.88:8124/syracuse-main/html/main.html?url=/trans/x3/erp/MMLIVE/$sessions?f%3DGEXPOBJ%252F2%252F%252FM%252F%26profile%3D~(loc~'en-US~role~'57cffaa1-ff5b-4b2e-bdb0-b9870562975c~ep~'1cd0ef0b-195b-4051-b14e-7bf20f0e31bd~appConn~(KEY1~'x3))"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Sage X3 Link to Extract file (select YSTLOTLOC)
                  </a>
                  <Input
                    type="file"
                    onChange={handleERPFileUpload}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                    required
                    disabled={!location}
                  />
                  <span className="text-xs text-gray-500">
                    Upload ERP stock count file (S;REF;Lot;Location;Quantity)
                  </span>
                </Field>
              )}

              <Button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Start Scanning
              </Button>
            </Fieldset>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetupForm;
