// @ts-nocheck

import { Response, Request } from "express";
import axios from "axios";
import { TaxResponse } from "./common/interfaces/TaxResponse";
import { FrontTaxInfo } from "./common/interfaces/FrontTaxInfo";
import { History } from "./models/History";

/**
 * Запрос на по api к налоговой чтобы получить инфо о магазине. На входе - данные о покуаке после
 * qr распознавания. На выходе - фронт ответ для отрисовки пользователю.
 * @param req
 * @param res
 */
export const makeApiRequest = async (req: Request, res: Response) => {
  const fullCheckInfo = await getFullCheckInfoByUserData(
    req.body?.qrraw ??
      "t=20240131T2126&s=47718.00&fn=7284440500275777&i=4044&fp=1511848317&n=1",
  );
  const fullTaxInfo: TaxResponse = fullCheckInfo.data.data;
  const percent = 2;

  const frontData: FrontTaxInfo = {
    store: fullTaxInfo.json.user,
    sum: fullTaxInfo.json.totalSum / 100,
    percent,
    bonuses: (fullTaxInfo.json.totalSum / 100) * (percent / 100),
  };

  res.status(201).json({ data: frontData });
};
/**
 * Запрос к api налоговой
 * @param requestData
 */
const getFullCheckInfoByUserData = async (requestData: string) => {
  const res = await axios.post("https://proverkacheka.com/api/v1/check/get", {
    token: "\n" + "    26925.ZLxfXjNQJYAPQONSW ",
    // qrraw:
    //   // !req.body?.qrraw ??
    //   "t=20240131T2126&s=47718.00&fn=7284440500275777&i=4044&fp=1511848317&n=1",
    qrraw: requestData,
  });
  return res;
};
/**
 * Обработка зачисление бонусов пользователю
 * @param req
 * @param res
 */
const addBonuses = async (req: Request, res: Response) => {
  const fullCheckInfo = await getFullCheckInfoByUserData(
    req.body?.qrraw ??
      "t=20240131T2126&s=47718.00&fn=7284440500275777&i=4044&fp=1511848317&n=1",
  );
  await History.insertMany({});
};
