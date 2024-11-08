import React, { useEffect, useState } from 'react'
import CartInfoItem, { CartInfoItemProps } from './CartInfoItem'
import { IListing } from '../../types/book'
import { GrUserManager } from 'react-icons/gr'
import { RiCalendarTodoLine, RiMapPin2Line } from 'react-icons/ri'
import { PiMoney, PiPhone } from 'react-icons/pi'
import { GiMoneyStack } from 'react-icons/gi'
import { TbSum } from 'react-icons/tb'
import dayjs from 'dayjs'
import { formatCurrency, formatPhoneNumber } from '../../utils/helps'
import { useStoreCart } from '../../hooks/cart'
import { getBookDetailService } from '../../api/bookListService'
import { useStoreAlert } from '../../hooks/alert'
import { useStoreStep } from '../../hooks/step'
import { useStoreVoucher } from '../../hooks/voucher'
import { IVoucherSession } from '../../types/voucher'
import { countDiscount } from './voucherSession/calculateVoucher'

const calculateTotalPriceAfterVoucher = (book: IListing | undefined, voucher: IVoucherSession | undefined, voucherShop: IVoucherSession | undefined): number => {
  if (book == undefined) return 0;

  let price = (book?.price || 1)
  let discount = countDiscount(book, voucher);
  let discountShop = countDiscount(book, voucherShop);

  // Tính tổng tiền sau khi áp dụng voucher, đảm bảo không âm
  const totalPrice = Math.max(price - discount - discountShop, 0);

  return totalPrice;
}

const InfoCheckout = () => {
  const { tabNum } = useStoreStep();
  const { voucher, voucherShop } = useStoreVoucher();
  const cart = useStoreCart(state => state.cart);
  const { callErrorAlert } = useStoreAlert();
  const [book, setBook] = useState<IListing>();
  useEffect(() => {
    const callApiGetBookDetail = async () => {
      const bookId = tabNum === 1 ? cart.buy?.bookId : cart.rent?.bookId;
      if (!bookId)
        return;
      try {
        const newBook = await getBookDetailService(bookId.toString());
        if (typeof newBook !== "string") {
          setBook(newBook);
        } else {
          callErrorAlert(newBook);
        }
      } catch (error) {
        console.log({ error });
      }
    }
    callApiGetBookDetail();
  }, [callErrorAlert, cart.buy?.bookId, cart.rent?.bookId, tabNum])
  const listUserInfo: Array<CartInfoItemProps> = [
    {
      title: `Người ${tabNum == 1 ? `bán` : `cho thuê`}`,
      description: `${book?.user.lastName} ${book?.user.firstName}`,
      children: <GrUserManager className="total__icon" />
    },
    ...(tabNum == 0 ? [
      {
        title: 'Thời gian thuê',
        description: `${dayjs(cart?.rent?.dayRent.dateStart).format("DD/MM/YYYY")} - ${dayjs(cart?.rent?.dayRent.dateEnd).format("DD/MM/YYYY")}`,
        children: <RiCalendarTodoLine className="total__icon" />
      }
    ] : []),
    {
      title: 'Địa chỉ',
      description: book?.address,
      children: <RiMapPin2Line className="total__icon" />
    },
    {
      title: 'Số điện thoại',
      description: formatPhoneNumber(book?.user.phoneNumber),
      children: <PiPhone className="total__icon" />
    },
    ...(tabNum === 0 ? [
      {
        title: 'Số ngày thuê',
        description: cart?.rent?.duration,
        children: <RiCalendarTodoLine className="total__icon" />
      },
      {
        title: 'Tiền thuê',
        description: formatCurrency(cart?.rent?.totalRent),
        children: <PiMoney className="total__icon" />
      },
      {
        title: 'Tiền cọc',
        description: formatCurrency(book?.depositFee),
        children: <GiMoneyStack className="total__icon" />
      },
      {
        title: 'Tổng cộng',
        description: formatCurrency(cart?.rent?.total),
        children: <TbSum className="total__icon" />
      },
    ] : [{
      title: 'Khuyến mãi từ The Flying Bookstore',
      description: formatCurrency(countDiscount(book, voucher)),
      children: <TbSum className="total__icon" />
    }, {
      title: 'Khuyến mãi từ shop',
      description: formatCurrency(countDiscount(book, voucherShop)),
      children: <TbSum className="total__icon" />
    }, {
      title: 'Giá mua',
      description: formatCurrency(book?.price),
      children: <TbSum className="total__icon" />
    }, {
      title: 'Tổng cộng',
      description: formatCurrency(calculateTotalPriceAfterVoucher(book, voucher, voucherShop)),
      children: <TbSum className="total__icon" />
    },]),
  ]
  return (
    <div className="total">
      {listUserInfo.map(({ children, description, title }, index) => (<CartInfoItem key={index * 2} title={title} description={description} >{children}</CartInfoItem>))}
    </div>
  )
}

export default InfoCheckout