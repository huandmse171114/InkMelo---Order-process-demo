import logo from './logo.svg';
import './App.css';
import Car from './Car';
import { SERVER_URL } from "./constant";
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';


function App() {

 const [startCheckout, setStartCheckout] = useState(false)
  const [shipment, setShipment] = useState(null)
  const [shippingServices, setShippingService] = useState([])
  const [selectedShippingServices, setSelectedShippingService] = useState(null)
  const [shippingFee, setShippingFee] = useState(null)
  const [shippingDate, setShippingDate] = useState(null)

  useEffect(() => {
    async function fetchData() {
      const shipmentResponse = await fetch(
        "http://localhost:8080/store/api/v1/customer/user1/shipments/default",
        {
          method: 'GET',
          headers: {'content-type': 'application/json'},
          redirect: 'follow'
        }
      ).then(response => response.json())
  
      const shipmentData = shipmentResponse.data
      console.log(shipmentData)
      setShipment(shipmentData)
    }

    if (startCheckout) fetchData()
  }, [startCheckout])

  useEffect(() => {
    async function fetchData() {
      const shippingServices = await fetch(
        `http://localhost:8080/store/api/v1/ghn/get-service/${shipment.districtId}`
      ).then(response => response.json())
      console.log("aaaaaaaaaaaaaaaaaaaa")
      console.log(shippingServices)
      setShippingService(shippingServices.data)
      setSelectedShippingService(shippingServices.data[0].service_id)
    }

    if (shipment !== null) fetchData()
  }, [shipment])

  useEffect(() => {
    async function fetchShippingFeeData() {
      const shippingFeeResponse = await fetch(
        `http://localhost:8080/store/api/v1/ghn/calculate-fee?toDistrictId=${shipment.districtId}&toWardCode=${shipment.wardCode}&serviceId=${selectedShippingServices}&quantity=${2}`
      ).then(response => response.json())

      console.log(shippingFeeResponse)
      setShippingFee(shippingFeeResponse.data)
    }

    async function fetchShippingDateData() {
      const shippingDateResponse = await fetch(
        `http://localhost:8080/store/api/v1/ghn/delivery-time?toDistrictId=${shipment.districtId}&toWardCode=${shipment.wardCode}&serviceId=${selectedShippingServices}`
      ).then(response => response.json())

      console.log(shippingDateResponse)
      setShippingDate(shippingDateResponse)
    }

    if (selectedShippingServices !== null) {
      fetchShippingDateData()
      fetchShippingFeeData()
    }
  }, [selectedShippingServices])

  const handleClickCheckout = async () => {

    const body4 = {
        totalPrice: 10000,
        shippingFee: shippingFee.total,
        shipmentId: shipment.id,
        serviceId: selectedShippingServices,
        quantity: 13,
        items: [
          1, 2, 3, 4
        ],
        redirectUrl: "http://localhost:3000/"
    }

    console.log(body4)

    const paymentUrl = await fetch(
      `http://localhost:8080/store/api/v1/customer/user1/orders`,
      {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        redirect: 'follow',
        body: JSON.stringify(body4)
      }
    ).then(response => response.json())

    document.location = paymentUrl.paymentUrl

  }

  return (
    <div className="App">
      {!startCheckout &&
        <button onClick={e => setStartCheckout(true)}>Tiến hành đặt hàng</button>
      }
      <h2>Thông tin đơn hàng</h2>
      {
        shipment !== null &&
        <div>
          <p>Người nhận: {shipment.receiverName}</p>
          <p>Số điện thoại liên lạc: {shipment.contactNumber}</p>
          <p>Chú thích: {shipment.description}</p>
          <p>Địa chỉ: {shipment.street}</p>
          <p>Phường/Xã: {shipment.ward}</p>
          <p>Quận/Huyện: {shipment.district}</p>
          <p>Tỉnh/Thành: {shipment.province}</p>
          {shippingServices !== null &&
          <label>
            <p>Phương thức vận chuyển</p>
            <select style={{padding: '8px'}} onChange={e => {
              setSelectedShippingService(e.target.value)
              console.log(e.target.value)
              }}>
              {shippingServices.map(service => {
                return <option value={service.service_id}>{service.short_name}</option>
              })}
            </select>
          </label>
          }
          <p>Tổng giá tiền đơn hàng: {10000} VND</p>
          <p>Phí vận chuyển: {shippingFee !== null ? shippingFee.total : "Đang tính toán"} VND</p>
          <p>Tổng giá tiền đơn hàng: {10000 + (shippingFee !== null ? shippingFee.total : 0)} VND</p>
          <p>Dự kiến ngày giao hàng: {shippingDate !== null ? shippingDate : "Đang tính toán"}</p>
          <button onClick={handleClickCheckout} >Thanh toán</button>
        </div>
      }
    </div>
  );
}

export default App;
