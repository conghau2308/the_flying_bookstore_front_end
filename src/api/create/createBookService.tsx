import axios, { AxiosResponse } from "axios";
import { headerAxios, port } from "../../utils/env";
import { IBook } from "../../types/book";
import { IFrontEndError, isFrontEndError, isServerError, IValidationError } from "../../types/error";
import { handleError } from "../handleError";


const onCreateBook = async (data: string): Promise<AxiosResponse<IBook> | string> => {
  try {
    const response = await axios.request({
      method: "POST",
      maxBodyLength: Infinity,
      url: `${port}/api/book`,
      headers: {
        ...headerAxios,

        "Content-Type": "application/json",
      },
      data,
    });
    return response;
  } catch (error: unknown) {
    return handleError(error);
  }
};
const getAllBooksService = async () => {
  try {
    const response = await axios.request({ url: `${port}/api/book`, headers: headerAxios });
    return response.data;
  }
  catch (error) {
    console.log(error);
  };
}
export { onCreateBook, getAllBooksService }