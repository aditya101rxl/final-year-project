import React, { useState } from 'react';
import { useEffect } from 'react';

export default function SelectCity() {
  const [cityList, setCityList] = useState(['opt1', 'opt2']);

  useEffect(() => {}, []);

  const onSelect = (e) => {
    localStorage.setItem('userShopCity', e.target.value);
    console.log(localStorage.getItem('userShopCity'));
  };

  return (
    <div className="select-city w-25">
      {/* <span style={{ color: 'white', fontSize: '18px', fontWeight: '600' }}>
        City:&nbsp;
      </span> */}
      <select
        class="form-select"
        aria-label="Default select example"
        onChange={onSelect}
      >
        <option selected>
          {localStorage.getItem('userShopCity')
            ? localStorage.getItem('userShopCity')
            : 'Select City'}
        </option>
        <hr></hr>
        {cityList.map((city) => (
          <option value={city}>{city}</option>
        ))}
      </select>
    </div>
  );
}
