import React from 'react';

const CustomTooltip = ({ active, payload, label }) => {
   if (active && payload && payload.length) {
      return (
         <div className="custom-tooltip">
         <p className="custom-tooltip-label">{`Date: ${new Date(label).toLocaleDateString()}`}</p>
         <div className="custom-tooltip-data">
            <span>Time: {new Date(label).toLocaleTimeString()}</span>
            <span>Price: <span className="custom-tooltip-price">{`$${payload[0].value.toFixed(2)}`}</span></span>
         </div>
         </div>
      );
   }

   return null;
};

export default CustomTooltip;