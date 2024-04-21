// @ts-nocheck

import e, { Response, Request, raw } from "express";
import axios from "axios";
import { TaxResponse } from "./common/interfaces/TaxResponse";
import { FrontTaxInfo } from "./common/interfaces/FrontTaxInfo";
import { History } from "./models/History";
import { Partner, Partners } from "./models/Partner";
import { HistoryOperationTypes } from "./common/enums/HistoryOperationTypes";
import { User } from "./models/User";
import { Types } from "mongoose";
import { ObjectId } from "mongodb";
import { ResponseStatuses } from "./common/enums/ResponseStatuses";
import {
  IHistoryItem,
  IHistoryItemFull,
} from "./common/interfaces/IHistoryItem";
import { getApiKey } from "./utils";
import { Stream } from "stream";

/**
 * Пока в системе один юзер
 */
const userId = "6623c1b47a520a52efb56917";

/**
 * Запрос на по api к налоговой чтобы получить инфо о магазине. На входе - данные о покуаке после
 * qr распознавания. На выходе - фронт ответ для отрисовки пользователю.
 * @param req
 * @param res
 */
export const qrScan = async (req: Request, res: Response) => {
  const fullCheckInfo = await getFullCheckInfoByUserData(
    req.body?.qrraw ??
      "t=20240131T2126&s=47718.00&fn=7284440500275777&i=4044&fp=1511848317&n=1",
  );
  const fullTaxInfo: TaxResponse = fullCheckInfo.data.data;
  console.log(fullTaxInfo);
  console.log("фнс!!!");
  const partner = await Partner.findOne({ inn: fullTaxInfo.json.userInn });
  // console.log(partner);
  // console.log("важно!!!");
  const percent = partner.percent;

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
    // token: "\n" + "    26925.ZLxfXjNQJYAPQONSW ",
    // token: "26926.oP1F9klGmDkNogJA6",
    token: getApiKey(),
    // qrraw:
    //   // !req.body?.qrraw ??
    //   "t=20240131T2126&s=47718.00&fn=7284440500275777&i=4044&fp=1511848317&n=1",
    qrraw: requestData,
  });
  res.data.data.json.userInn = res.data.data.json.userInn.trim();
  return res;
};
/**
 * Обработка зачисление бонусов пользователю
 * @param req
 * @param res
 */
export const addBonuses = async (req: Request, res: Response) => {
  const qrStr =
    req.body?.qrraw ??
    "t=20240131T2126&s=47718.00&fn=7284440500275777&i=4044&fp=1511848317&n=1";
  const fullCheckInfo = await getFullCheckInfoByUserData(qrStr);
  const fullTaxInfo: TaxResponse = fullCheckInfo.data.data;
  const partner = await Partner.findOne({ inn: fullTaxInfo.json.userInn });

  const operation = await History.findOne({
    qrStr: qrStr,
  });
  console.log(operation);
  /**
   * проверяем, есть ли уже такая операция в базе
   */
  if (!operation) {
    const currentUser = await User.findOne({ _id: new ObjectId(userId) });
    await History.insertMany({
      sum: fullTaxInfo.json.totalSum / 100,
      bonuses: (fullTaxInfo.json.totalSum / 100) * (partner.percent / 100),
      operationType: HistoryOperationTypes.income,
      qrStr: qrStr,
      partnerId: partner._id,
      userId: new ObjectId(userId),
      /**
       * Время в секундах
       */
      time: parseInt(new Date().getTime() / 1000),
    });

    await User.findOneAndUpdate(
      {
        _id: new ObjectId(userId),
      },
      {
        balance:
          currentUser.balance +
          (fullTaxInfo.json.totalSum / 100) * (partner.percent / 100),
      },
    );
    return res.status(201).json({ status: ResponseStatuses.ok });
  } else {
    return res.status(201).json({
      status: ResponseStatuses.error,
      msg: "Такой qr уже учтен в базе данных",
    });
  }
};
export const getHistoryItems = async (req: Request, res: Response) => {
  const listOfOperations: IHistoryItem[] = await History.aggregate([
    {
      $match: {
        userId: new ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "partners",
        localField: "partnerId",
        foreignField: "_id",
        as: "partner",
      },
    },
    { $sort: { time: -1 } },
  ]);

  return res.status(201).json({
    status: ResponseStatuses.ok,
    data: listOfOperations,
  });
};
export const addPartner = async (req: Request, res: Response) => {
  const partner = req.body.partner;
  await Partner.findOneAndUpdate(
    {
      name: partner.name,
    },
    {
      ...partner,
    },
    {
      new: true,
      upsert: true,
    },
  );
  return res.status(201).json({ status: ResponseStatuses.ok });
};
