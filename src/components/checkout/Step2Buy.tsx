import { Alert, Button } from "@mui/material";
import "./../cart/Cart.scss";
import { CiShoppingCart } from "react-icons/ci";
import Link from "next/link";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import Order from "./Order";
import { useStoreOrder } from "../../hooks/order";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { IBuyOrder, IOrderStatus, IOrderStatusBuy } from "../../types/order";
import { renderPayment } from "./PaymentStatus";
import { useUrl } from "nextjs-current-url";
import { parseUrlParams } from "./parseUrlParams";
import { IParamsVNpay } from "../../types/checkout";
import { getDetailBuyOrder, getDetailRentOrder, updateStatusOrder } from "../../api/order";
import { useAuthStore } from "../../hooks/user";
import { useStoreAlert } from "../../hooks/alert";
import { useStoreStep } from "../../hooks/step";
import OrderBuy from "./OrderBuy";

const Step2Buy = ({
}: {
}) => {
  const { rentOrderId, buyOrderId } = useStoreOrder();
  const [orderDetail, setOrderDetail] = useState<IBuyOrder>();
  const { href: currentUrl } = useUrl() ?? {};
  const { token } = useAuthStore()
  const { tabNum } = useStoreStep();
  const { callAlert, callErrorAlert } = useStoreAlert(state => state);
  const orderId = tabNum == 1 ? buyOrderId : rentOrderId;
  const getOrder = async () => {
    if (!orderId || !token) return;
    return await updateStatusOrder(
      "DELIVERED",
      orderId,
      token
    ).then(() => {
      callAlert("Cập nhập đơn hàng thành công")
    });
  };
  useEffect(() => {
    const getStatusOrder = async () => {
      if (!currentUrl || !token) return;
      const params: IParamsVNpay = parseUrlParams(currentUrl);
      if (params.vnp_TransactionStatus == "00" && orderId) {
        // gọi api thay đổi trạng thái đơn hàng ở đây
        return await updateStatusOrder("PAYMENT_SUCCESS", orderId, token).then(async () => {
          callAlert("Thanh toán thành công");
          return await getDetailRentOrder(orderId).then((response) => {
            if (typeof response != "string") {
              setOrderDetail(response.data);
            } else {
              callErrorAlert(response)
            }
          });
        });
      }
    };
    getStatusOrder();
  }, [callAlert, callErrorAlert, currentUrl, orderId, token]);

  useEffect(() => {
    const getOrderApi = async () => {
      if (!orderId) return callErrorAlert("Không có chi tiết đơn hàng");
      const response = await getDetailBuyOrder(orderId);
      if (typeof response != "string") {
        setOrderDetail(response?.data);
      } else {
        callErrorAlert(response)
      }
    };

    getOrderApi();
  }, [callErrorAlert, orderId, tabNum]);

  const renderAlert = (status?: IOrderStatusBuy | undefined) => {
    if (!status) return <></>;
    let contentAlert = <></>;
    switch (status) {
      case "PAYMENT_SUCCESS":
        contentAlert = (
          <>
            Mời bạn đến địa chỉ cho thuê để lấy tài liệu, sau đó bạn hãy bấm nút
            &apos;Xác nhận lấy hàng&apos; dưới đây
          </>
        );
        break;
      case "ORDERED_PAYMENT_PENDING":
        contentAlert = (
          <>
            Bạn hãy nhanh chóng thanh toán theo phương thức{" "}
            {renderPayment(orderDetail?.paymentMethod)} để lấy hàng
          </>
        );
        break;
      default:
        contentAlert = <>Chưa định nghĩa</>;
        break;
    }
    return (
      <div className="mt-10 w-2/3 mx-auto">
        <Alert severity="info">{contentAlert}</Alert>
      </div>
    );
  };

  return (
    <>
      <div className="w-2/3 mx-auto border rounded-lg py-8 mt-20 px-10">
        <h3 className="mb-5 text-center text-primary text-2xl font-semibold text-primary">
          Đơn hàng được tạo thành công!
        </h3>
        {orderDetail ? (
          <OrderBuy orderDetail={orderDetail} />
        ) : (
          <>Không có đơn hàng</>
        )}
      </div>
      {renderAlert(orderDetail?.status)}

      <div className=" mt-10 mb-20 w-2/3 mx-auto flex justify-between">
        <Link href="/">
          <Button
            variant="contained"
            color="secondary"
            sx={{ color: "white", textTransform: "none" }}
            size="large"
            startIcon={<CiShoppingCart />}
          >
            Tiếp tục mua sắm
          </Button>
        </Link>
        <Link href={tabNum == 1 ? "/buy-order" : "/my-order/0"}>
          <Button
            variant="outlined"
            sx={{ textTransform: "none" }}
            size="large"
          >
            Quản lý đơn hàng
          </Button>
        </Link>

        <Button
          variant="contained"
          sx={{ textTransform: "none", color: "white" }}
          size="large"
          disabled={orderDetail?.status !== "PAYMENT_SUCCESS"}
          startIcon={<IoCheckmarkCircleOutline />}
          onClick={getOrder}
        >
          Xác nhận lấy hàng
        </Button>
      </div>
    </>
  );
};

export default Step2Buy;
