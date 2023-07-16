import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import Datepicker from "react-tailwindcss-datepicker";
import classNames from "classnames";
import { type DateValueType } from "react-tailwindcss-datepicker/dist/types";
import { api } from "~/utils/api";
import dayjs from "dayjs";
import BusinessTime from "dayjs-business-time";
import Stat from "./stat";

type Inputs = {
  reason: string;
  type: string;
};

interface FormPropTypes {
  className?: string;
}

const currentDate = new Date();
dayjs.extend(BusinessTime);

export default function Form({ className = "" }: FormPropTypes) {
  const utils = api.useContext();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();

  const [dateRange, setDateRange] = useState<DateValueType>({
    startDate: null,
    endDate: null,
  });

  const [cost, setCost] = useState<number>(0);
  const leaveType = watch("type");

  const [isDateValid, setIsDateValid] = useState<boolean>(true);

  const handleValueChange = (newValue: DateValueType) => {
    const start = dayjs(newValue?.startDate);
    const end = dayjs(newValue?.endDate);

    if (start.isBefore(new Date(), "day")) {
      return setIsDateValid(false);
    }

    setCost(Math.abs(start.businessDaysDiff(end)));

    setIsDateValid(true);
    setDateRange(newValue);
  };

  const createRequest = api.leaveForms.create.useMutation({
    onSuccess: (data) => utils.invalidate(),
  });

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    if (!isDateValid) return;

    createRequest.mutate({
      reason: data.reason,
      type: data.type,
      startDate: new Date(dateRange?.startDate),
      endDate: new Date(dateRange?.endDate),
    });
  };

  return (
    <form
      className={classNames(
        "m-4 mx-auto flex flex-col gap-1 rounded-md border p-5 shadow",
        className
      )}
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onSubmit={handleSubmit(onSubmit)}
    >
      <div>
        <h1 className="text-4xl font-bold">Leave Form</h1>
        <div className="divider my-0"></div>
      </div>
      <div className="flex gap-2">
        <div
          className={classNames("form-control w-full max-w-xs", {
            "text-red-500": !isDateValid,
          })}
        >
          <label className="label">
            <span className="label-text text-lg">Enter Date</span>
          </label>
          <Datepicker
            primaryColor={"green"}
            minDate={currentDate}
            value={dateRange}
            onChange={handleValueChange}
            separator="to"
          />
          {!isDateValid ? (
            <label className="label w-full">
              <span className="label-text-alt">
                Please ensure that the start date is either today or a future
                date.
              </span>
            </label>
          ) : (
            ""
          )}
        </div>
        <Stat
          title={`Cost (${leaveType === "whole" ? "Whole Day" : "Half Day"})`}
          value={leaveType === "whole" ? cost : cost / 2}
        />
      </div>
      <div>
        <label className="label my-0">
          <span className="label-text text-lg">Type</span>
        </label>
        <div className="join">
          <input
            className="join-item btn rounded-l"
            type="radio"
            aria-label="Whole Day"
            value="whole"
            {...register("type")}
          />
          <input
            className="join-item btn rounded-r"
            type="radio"
            aria-label="Half Day"
            value="half"
            {...register("type")}
          />
        </div>
      </div>
      <div>
        <label className="label my-0">
          <span className="label-text text-lg">Reason</span>
        </label>
        <textarea
          className="textarea-bordered textarea w-full"
          placeholder="Enter your reason..."
          {...register("reason")}
          required
        ></textarea>
      </div>
      <input
        type="submit"
        placeholder="Submit"
        value={"Submit"}
        className="btn-primary btn"
      />
    </form>
  );
}
