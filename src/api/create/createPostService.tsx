import axios from "axios";
import { headerAxios, port } from "../../utils/env";
import { handleError } from "../handleError";

const onCreateListing = async (data: any, token: string) => {
    try {
        const respone = await axios.request({
            method: "POST",
            maxBodyLength: Infinity,
            url: `${port}/api/listing`,
            headers: {
                ...headerAxios,
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            data,
        });
        return respone;
    }
    catch (error) {
        return handleError(error)
    };
};

export { onCreateListing }