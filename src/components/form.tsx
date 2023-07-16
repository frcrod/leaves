import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import Datepicker from "react-tailwindcss-datepicker";
import { type DateValueType } from "react-tailwindcss-datepicker/dist/types";
import { api } from "~/utils/api";

type Inputs = {
  reason: string;
  type: string;
};

export default function Form({ refetch }) {
  const utils = api.useContext();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const [dateRange, setDateRange] = useState<DateValueType>({
    startDate: null,
    endDate: null,
  });

  const handleValueChange = (newValue: DateValueType) => {
    setDateRange(newValue);
  };

  const createRequest = api.leaveForms.create.useMutation({
    onSuccess: (data) => console.log(data),
  });

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    createRequest.mutate({
      reason: data.reason,
      type: data.type,
      startDate: new Date(dateRange?.startDate),
      endDate: new Date(dateRange?.endDate),
    });

    refetch();
  };

  return (
    <form
      className="m-4 mx-auto flex w-9/12 flex-col gap-3 rounded border p-5"
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onSubmit={handleSubmit(onSubmit)}
    >
      <h1 className="text-2xl font-bold">Leave Form</h1>
      <div className="form-control w-full max-w-xs">
        <label className="label">
          <span className="label-text text-lg">Enter Date</span>
        </label>
        <Datepicker value={dateRange} onChange={handleValueChange} />
      </div>
      <div>
        <label className="label my-0">
          <span className="label-text text-lg">Type</span>
        </label>
        <div className="join">
          <input
            className="join-item btn"
            type="radio"
            aria-label="Whole Day"
            value="whole"
            {...register("type")}
          />
          <input
            className="join-item btn"
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
        ></textarea>
      </div>
      <input type="submit" placeholder="Submit" className="btn" />
    </form>
  );
}
