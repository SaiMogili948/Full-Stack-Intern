
import React, { useState, useEffect } from 'react';
import { courts, equipment, coaches, pricingRules } from '../data/mockData';
import { calculateTotalPrice, isPeakHour } from '../utils/pricing';

const BookingForm = ({ addBooking }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [courtId, setCourtId] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [coachId, setCoachId] = useState('');
  const [priceInfo, setPriceInfo] = useState({ total: 0, breakdown: [] });

  const availableTimes = ['10:00', '11:00', '12:00', '18:00', '19:00', '20:00', '21:00'];

  
  useEffect(() => {
    if (!courtId || !date || !time) {
      setPriceInfo({ total: 0, breakdown: [] });
      return;
    }

    const price = calculateTotalPrice(
      parseInt(courtId),
      selectedEquipment,
      coachId ? parseInt(coachId) : null,
      date,
      time,
      pricingRules
    );

    setPriceInfo(price);
  }, [courtId, selectedEquipment, coachId, date, time]);

  const toggleEquipment = (id) => {
    setSelectedEquipment(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const court = courts.find(c => c.id === parseInt(courtId));
    const selectedCoach = coachId ? coaches.find(c => c.id === parseInt(coachId)) : null;

    const newBooking = {
      id: Date.now(),
      date,
      time,
      court: court.name,
      equipment: selectedEquipment.map(id => {
        const item = equipment.find(e => e.id === id);
        return item ? item.name : '';
      }),
      coach: selectedCoach ? selectedCoach.name : 'None',
      totalPrice: priceInfo.total,
      bookedAt: new Date().toLocaleString(),
    };

    addBooking(newBooking);
    alert(`Booking Confirmed!\nTotal: $${priceInfo.total}`);

    // Reset form
    setDate('');
    setTime('');
    setCourtId('');
    setSelectedEquipment([]);
    setCoachId('');
    setPriceInfo({ total: 0, breakdown: [] });
  };

  return (
    <div className="card">
      <h2>Book Your Badminton Court</h2>

      <form onSubmit={handleSubmit}>
        {/* Date */}
        <div>
          <label>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/*Time */}
        <div>
          <label>Time Slot</label>
          <select value={time} onChange={(e) => setTime(e.target.value)} required>
            <option value="">Select time</option>
            {availableTimes.map(t => (
              <option key={t} value={t}>
                {t} {isPeakHour(t) ? '(Peak Hour)' : '(Normal Hour)'}
              </option>
            ))}
          </select>
        </div>

        {/* Court */}
        <div>
          <label>Select Court</label>
          <select value={courtId} onChange={(e) => setCourtId(e.target.value)} required>
            <option value="">Choose a court</option>
            {courts.map(court => (
              <option key={court.id} value={court.id}>
                {court.name} ({court.type.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {/* Equipment */}
        <div>
          <label>Equipment (Optional)</label>
          {equipment.map(item => (
            <label key={item.id} style={{ display: 'block', margin: '10px 0' }}>
              <input
                type="checkbox"
                checked={selectedEquipment.includes(item.id)}
                onChange={() => toggleEquipment(item.id)}
              />{' '}
              {item.name} (+${item.price})
            </label>
          ))}
        </div>

        {/* Coach */}
        <div>
          <label>Book a Coach (Optional)</label>
          <select value={coachId} onChange={(e) => setCoachId(e.target.value)}>
            <option value="">No coach</option>
            {coaches.map(coach => (
              <option key={coach.id} value={coach.id}>
                {coach.name} (+${coach.hourlyRate}/hr)
              </option>
            ))}
          </select>
        </div>

        {/* Live Price */}
        {priceInfo.total > 0 && (
          <div className="price-breakdown">
            <div style={{ fontSize: '1.8em', margin: '10px 0' }}>
              Total: <strong>${priceInfo.total}</strong>
            </div>
            <div style={{ fontSize: '0.95em', color: '#444' }}>
              {priceInfo.breakdown.join(' → ')}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!date || !time || !courtId}
          style={{ width: '100%', padding: '14px', fontSize: '18px', marginTop: '20px' }}
        >
          Confirm Booking — Pay ${priceInfo.total || 0}
        </button>
      </form>
    </div>
  );
};

export default BookingForm;
