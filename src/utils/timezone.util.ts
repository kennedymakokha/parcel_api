// utils/timezone.util.ts

import moment from "moment-timezone";

export const TIMEZONE = "Africa/Nairobi";

export const getDateRangeByFilter = (
  filterType: string,
  startDate?: string,
  endDate?: string
) => {
  let start: Date;
  let end: Date;

  switch (filterType) {
    case "today":
      start = moment.tz(TIMEZONE).startOf("day").toDate();
      end = moment.tz(TIMEZONE).endOf("day").toDate();
      break;

    case "yesterday":
      start = moment.tz(TIMEZONE).subtract(1, "day").startOf("day").toDate();
      end = moment.tz(TIMEZONE).subtract(1, "day").endOf("day").toDate();
      break;

    case "week":
      start = moment.tz(TIMEZONE).startOf("week").toDate();
      end = moment.tz(TIMEZONE).endOf("day").toDate();
      break;

    case "month":
      start = moment.tz(TIMEZONE).startOf("month").toDate();
      end = moment.tz(TIMEZONE).endOf("day").toDate();
      break;

    case "year":
      start = moment.tz(TIMEZONE).startOf("year").toDate();
      end = moment.tz(TIMEZONE).endOf("day").toDate();
      break;

    case "custom":
      start = moment.tz(startDate, TIMEZONE).startOf("day").toDate();
      end = moment.tz(endDate, TIMEZONE).endOf("day").toDate();
      break;

    default:
      start = moment.tz(TIMEZONE).startOf("day").toDate();
      end = moment.tz(TIMEZONE).endOf("day").toDate();
  }

  return { start, end };
};