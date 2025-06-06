import { Button, Grid, Typography, useTheme } from "@mui/material";
import Link from "next/link";
import { CiLocationArrow1 } from "react-icons/ci";
import { IBuyOrder, IBuyOrderConvert, IRentOrder, OrderType } from "../../types/order";
import dayjs from "dayjs";
import { renderStatus, renderStatusBuy } from "../checkout/PaymentStatus";
import { useStoreStep } from "../../hooks/step";
const renderUserName = (order: IBuyOrderConvert, orderType: OrderType): string => {
  switch (orderType) {
    case OrderType.Buy:
      return `${order?.seller?.lastName} ${order?.seller?.firstName}`; // Nếu là khách hàng
    case OrderType.Sell:
      return `${order?.buyer?.lastName} ${order?.buyer?.firstName}`; // Nếu là khách hàng
    default:
      return "Không có tên"; // Trả về giá trị mặc định nếu không có tên
  }
};
const orderUserTitles: Record<OrderType, string> = {
  [OrderType.Buy]: "Người mua",
  [OrderType.Sell]: "Người bán",
  [OrderType.Leasee]: "Người thuê",
  [OrderType.Leasor]: "Chủ sách",
};
const orderStakeholderTitles: Record<OrderType, string> = {
  [OrderType.Buy]: orderUserTitles[OrderType.Sell],
  [OrderType.Sell]: orderUserTitles[OrderType.Buy],
  [OrderType.Leasee]: orderUserTitles[OrderType.Leasor],
  [OrderType.Leasor]: orderUserTitles[OrderType.Leasee],
};
export const HeaderOrderBuy = ({
  order,
  orderType,
}: {
  order: IBuyOrderConvert;
  orderType: OrderType;
}) => {

  const theme = useTheme();
  return (
    <Grid
      container
      mt={0.1}
      mb={1}
      spacing={2}
      justifyItems="center"
      alignItems="center"
    >
      <Grid item xs={2}>
        <Typography variant="body2" sx={{ color: theme.palette.grey[600] }}>
          Id đơn hàng
        </Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
          #{order?.id}
        </Typography>
      </Grid>
      <Grid item xs={2}>
        <Typography variant="body2" sx={{ color: theme.palette.grey[600] }}>
          {orderStakeholderTitles[orderType] || orderStakeholderTitles[OrderType.Sell]}
        </Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
          {renderUserName(order, orderType)}
        </Typography>
      </Grid>
      <Grid item xs={3}>
        <Typography variant="body2" sx={{ color: theme.palette.grey[600] }}>
          Trạng thái {orderStakeholderTitles[orderType] || orderStakeholderTitles[OrderType.Sell]}
        </Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
          {renderStatusBuy(order?.status, orderType)}
        </Typography>
      </Grid>

      <Grid item xs={2}>
        <Link href={`/order/${order?.id}`}>
          <Button
            endIcon={<CiLocationArrow1 />}
            sx={{ textTransform: "none" }}
            variant="text"
          >
            Xem chi tiết
          </Button>
        </Link>
      </Grid>
    </Grid>
  );
};
