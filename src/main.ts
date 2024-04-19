// @ts-nocheck

import { Response, Request } from "express";
import axios from "axios";
import { NalogItem } from "./intefaces/NalogItem";
export const makeApiRequest = async (req: Request, res: Response) => {
  // const resp = await axios
  //   .get("https://jsonplaceholder.typicode.com/users")
  //   .then((res) => {
  //     const headerDate =
  //       res.headers && res.headers.date ? res.headers.date : "no response date";
  //     console.log("Status Code:", res.status);
  //     console.log("Date in Response header:", headerDate);
  //
  //     // const users = res.data;
  //     console.log(res.data);
  //
  //     // @ts-ignore
  //     // for (user of users) {
  //     //   console.log(`Got user with id: ${user.id}, name: ${user.name}`);
  //     // }
  //   })
  //   .catch((err) => {
  //     console.log("Error: ", err.message);
  //   });
  //
  // // const resp = await axios.get("https://jsonplaceholder.typicode.com/users");
  //
  // res.status(201).json({
  //   name: "fff",
  // });

  const fullCheckInfo = await axios.post(
    "https://proverkacheka.com/api/v1/check/get",
    {
      token: "\n" + "    26925.ZLxfXjNQJYAPQONSW ",
      qrraw:
        // !req.body?.qrraw ??
        "t=20240131T2126&s=47718.00&fn=7284440500275777&i=4044&fp=1511848317&n=1",
    },
  );
  const listOfItems: NalogItem[] = fullCheckInfo.data.data;
  const organizationName = "";
  const sum = 0;
  console.log(fullCheckInfo.data.data);
  // listOfItems.forEach((item) => {});

  res.status(201).json({ data: fullCheckInfo.data.data.json });
};
