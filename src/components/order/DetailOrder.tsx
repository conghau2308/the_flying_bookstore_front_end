import { Box } from "@mui/material";
import { HeaderOrder } from "./HeaderOrder";
import { DataGrid } from "@mui/x-data-grid";
import { IRow, columnsOrderRent, columnsOrderSellBuy, convertToRow } from "./column";
import NoData from "./NoData";
import OrderFooter from "./OrderFooter";
import {  IRentOrder, OrderType } from "../../types/order";
import { useState } from "react";
import theme from "../../utils/theme";
import { useStoreStep } from "../../hooks/step";

const DetailOrder = ({
  order,
  changeStatus,
  orderType,
  reloadButton
}: {
  reloadButton:()=> Promise<void>;
  order: IRentOrder;
  orderType: OrderType;
  changeStatus: (e: any, newValue: number) => void;
}) => {
  if (!order) return <>Hiện chưa có đơn hàng</>;
  return (
    <Box
      sx={{
        width: "100%",
        border: 1,
        borderRadius: 3,
        borderColor: theme.palette.grey[400],
        px: 2,
        py: 1,
        height: order && order.listing ? "auto" : "500px",
      }}
    >
      <HeaderOrder order={order} orderType={orderType} />
      <DataGrid
        rows={order && order.listing ? [convertToRow(order)] : []}
        columns={columnsOrderRent}
        disableRowSelectionOnClick
        slots={{ noRowsOverlay: NoData }}
        sx={{ border: "none" }}
        hideFooterPagination
        hideFooterSelectedRowCount
        hideFooter

      />
      <OrderFooter reloadButton={reloadButton} changeStatus={changeStatus} order={order} orderType={orderType} />
    </Box>
  );
};

export default DetailOrder;
