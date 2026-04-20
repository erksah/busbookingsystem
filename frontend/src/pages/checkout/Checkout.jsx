import React from "react";
import { useCheckout } from "./useCheckout";

import BookerForm from "./BookerForm";
import PassengerForm from "./PassengerForm";
import Summary from "./Summary";

const Checkout = () => {

  const {
    bus,
    error,
    loading,
    booker,
    passengers,
    selectedSeats,
    journeyDate,

    setBooker,
    handlePassengerChange,
    handleBooking
  } = useCheckout();

  if (!bus) return <p className="text-center mt-20">Loading...</p>;

  return (
    <div className="w-full lg:px-28 md:px-16 sm:px-7 px-4 mt-[13ch] mb-[8ch]">

      <div className="grid md:grid-cols-2 gap-10">

        {/* LEFT */}
        <div className="space-y-5">
          <BookerForm
            booker={booker}
            setBooker={setBooker}
            error={error}
          />

          <PassengerForm
            passengers={passengers}
            handlePassengerChange={handlePassengerChange}
          />
        </div>

        {/* RIGHT */}
        <Summary
          bus={bus}
          journeyDate={journeyDate}
          selectedSeats={selectedSeats}
          loading={loading}
          handleBooking={handleBooking}
        />

      </div>

    </div>
  );
};

export default Checkout;