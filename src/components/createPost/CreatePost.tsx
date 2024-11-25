import {
  AccordionActions,
  AccordionDetails,
  Autocomplete,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Controller, FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { Accordion, AccordionSummary } from "./AccordionCustom";
import { InputListing } from "./InputListing";
import axios from "axios";
import { useAuthStore } from "../../hooks/user";
import { useStoreAlert } from "../../hooks/alert";
import { useRouter } from "next/navigation";
import { onCreateListing } from "../../api/create/createPostService";
import { handleError } from "../../api/handleError";
import Link from "next/link";
import { IPostState } from "../../types/params";
enum EAllowType {
  AllowAll = "allowAll",
  AllowRent = "allow_rent",
  AllowPurchase = "allow_purchase"
}
interface IListingSubmit {
  ownerId: number;
  quantity: number;
  address: string;
  expiryDate: string;
  leaseRate: number;
  depositFee: number;
  penaltyRate: number;
  price: number;
  description: string;
  allow_rent: number;
  allow_purchase: number;
  copyId: string | number;
  listingStatus: string;
}

export type TFieldPostValue = {
  address: string;
  leaseRate: string; // must be number
  depositFee: string; // must be number
  penaltyRate: string; // must be number
  description: string;
  allowType: EAllowType;
  price: string; // must be number
};
const listForRent = (<><Grid item xs={4}>
  <InputListing
    label="Tiền cọc"
    name="depositFee"
    required
    isPost
    type="number"
  />
</Grid>

  <Grid item xs={4}>
    <InputListing
      label="Giá thuê theo ngày"
      name="leaseRate"
      required
      isPost
      type="number"
    />
  </Grid>
  <Grid item xs={4}>
    <InputListing
      label="Phí phạt trả trễ theo ngày"
      name="penaltyRate"
      required
      isPost
      type="number"
    />
  </Grid></>);

const listForPuschase = (
  <>
    <Grid item xs={6}>
      <InputListing
        label="Giá gốc"
        name="depositFee"
        required
        isPost
        type="number"
      />
    </Grid>
    <Grid item xs={6}>
      <InputListing
        label="Giá bán"
        name="price"
        required
        isPost
        type="number"
      />
    </Grid>
    <Grid item xs={12}>
      <Typography variant="body1" gutterBottom>Giá bán luôn nhỏ hơn giá gốc, vậy khi nhập giá gốc quý khách vui lòng nhập cao hơn để tránh trường hợp mất sách thì bị lỗ</Typography>
    </Grid>
  </>
);
const listForPuschaseAndRent = (
  <><Grid item xs={4}>
    <InputListing
      label="Tiền cọc"
      name="depositFee"
      required
      isPost
      type="number"
    />
  </Grid>

    <Grid item xs={4}>
      <InputListing
        label="Giá thuê theo ngày"
        name="leaseRate"
        required
        isPost
        type="number"
      />
    </Grid>
    <Grid item xs={4}>
      <InputListing
        label="Phí phạt trả trễ theo ngày"
        name="penaltyRate"
        required
        isPost
        type="number"
      />
    </Grid>

    <Grid item xs={4}>
      <InputListing
        label="Giá bán"
        name="price"
        required
        isPost
        type="number"
      />
    </Grid>
    <Grid item xs={8}>
      <Typography variant="body1" gutterBottom>Giá bán luôn nhỏ hơn tiền cọc, vậy khi nhập tiền cọc quý khách vui lòng nhập cao hơn để tránh trường hợp mất sách thì bị lỗ</Typography>
    </Grid>
  </>
);

const CreatePost = ({ copyId }: { copyId: IPostState["copyId"] }) => {
  const { profile, token } = useAuthStore();
  const methods = useForm<TFieldPostValue>({ defaultValues: { address: profile?.address, allowType: EAllowType.AllowAll } });
  const { handleSubmit, watch, control } = methods;
  const watchShowBuyOrRent = watch("allowType")
  console.log({ watchShowBuyOrRent });

  const router = useRouter()
  const { callAlert, callErrorAlert } = useStoreAlert()
  const onSubmit: SubmitHandler<TFieldPostValue> = async (value) => {
    if (!token || !profile?.id) return callErrorAlert("Vui lòng đăng nhập lại");
    const { address, depositFee, description, leaseRate, penaltyRate, allowType, price } = value;
    if (!copyId || typeof copyId === undefined) return callErrorAlert("Chọn tài liệu trước");
    let data: IListingSubmit = {
      copyId,
      ownerId: profile?.id,
      quantity: 1,
      expiryDate: "",
      listingStatus: "AVAILABLE",
      address,
      description,
      allow_purchase: 1,
      allow_rent: 1,
      leaseRate: parseFloat(leaseRate),
      depositFee: parseFloat(depositFee),
      penaltyRate: parseFloat(penaltyRate),
      price: parseFloat(price),
    }
    if (allowType === EAllowType.AllowPurchase) {
      data = {
        ...data,
        allow_rent: 0,
        allow_purchase: 1,
        leaseRate:0,//kí hiệu riêng, nếu depositFee == 0 thì chỉ cho mua hông cho bán
        penaltyRate:0
      }
    } else if (allowType === EAllowType.AllowRent) {
      data = {
        ...data,
        allow_purchase: 0,
        allow_rent: 1,
        price: 0, //kí hiệu riêng, price = 0 cho bán ko cho mua
      }
    }

    try {
      const response = await onCreateListing(data, token);
      if (typeof response != "string") {
        callAlert(`Tạo sách #${response?.data?.id} thành công`)
        // router.push(`/detail/${response?.data?.id}`) //TODO revert this
      }
      else {
        callErrorAlert(response);
      };
    } catch (error) {
      callErrorAlert(handleError(error))
    }

  };
  const renderListPrice = () => {
    switch (watchShowBuyOrRent) {
      case EAllowType.AllowPurchase:
        return listForPuschase
      case EAllowType.AllowRent:
        return listForRent

      default:
        return listForPuschaseAndRent
    }
  }
  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Accordion defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel3-content"
            id="panel3-header"
          >
            Bài đăng
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <InputListing
                  label="Mô tả trạng thái sách"
                  name="description"
                  required
                  isPost
                />
              </Grid>
              <Grid item xs={12} my={1}>
                <Controller
                  control={control}
                  name="allowType"
                  render={({ field: { onChange, value, name, }, formState: { defaultValues } }) => (
                    <FormControl>
                      <FormLabel id={name}>Chọn dịch vụ</FormLabel>
                      <RadioGroup
                        row
                        aria-labelledby={name}
                        name={name}
                        onChange={onChange}
                        value={value}
                        defaultValue={defaultValues?.allowType}
                      >
                        <FormControlLabel value={EAllowType.AllowAll} control={<Radio />} label="Thuê và bán" />
                        <FormControlLabel value={EAllowType.AllowRent} control={<Radio />} label="Chỉ thuê" />
                        <FormControlLabel value={EAllowType.AllowPurchase} control={<Radio />} label="Chỉ bán" />
                      </RadioGroup>
                    </FormControl>
                  )}
                />
              </Grid>
              {renderListPrice()}

              <Grid item xs={12}>
                <InputListing
                  label="Địa chỉ cho thuê"
                  name="address"
                  required
                  isPost
                />
              </Grid>
            </Grid>
          </AccordionDetails>
          <AccordionActions>
            <Button
              variant="contained"
              type="submit"
              onClick={handleSubmit(onSubmit)}
            >
              Tạo bài đăng
            </Button>
          </AccordionActions>
        </Accordion>
      </form>
    </FormProvider>
  );
};

export default CreatePost;
