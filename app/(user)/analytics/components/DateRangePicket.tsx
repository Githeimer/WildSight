import React, { useState } from 'react';

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onChange: (startDate: Date, endDate: Date) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Format date for input value
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  };
  
  // Handle date changes
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    onChange(newDate, endDate);
  };
  
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    onChange(startDate, newDate);
  };
  
  // Preset date ranges
  const applyPreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    onChange(start, end);
    setIsOpen(false);
  };
  
  return (
    <div className="relative">
      <div className="text-sm font-medium text-gray-700 mb-2">Date Range</div>
      
      {/* Date display button */}
      <button 
        className="bg-white border rounded px-4 py-2 flex items-center gap-2 text-gray-700 hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
        <span>
          {formatDate(startDate)} - {formatDate(endDate)}
        </span>
        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      
      {/* Date picker dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg border shadow-lg z-10 p-4">
          <div className="flex flex-col gap-4">
            <div>
              <div className="text-sm font-medium mb-1">Preset Ranges</div>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded"
                  onClick={() => applyPreset(7)}
                >
                  Last 7 Days
                </button>
                <button 
                  className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded"
                  onClick={() => applyPreset(30)}
                >
                  Last 30 Days
                </button>
                <button 
                  className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded"
                  onClick={() => applyPreset(90)}
                >
                  Last 90 Days
                </button>
                <button 
                  className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded"
                  onClick={() => applyPreset(365)}
                >
                  Last Year
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Start Date</label>
                <input 
                  type="date" 
                  className="w-full border rounded px-3 py-2"
                  value={formatDateForInput(startDate)}
                  onChange={handleStartDateChange}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">End Date</label>
                <input 
                  type="date" 
                  className="w-full border rounded px-3 py-2"
                  value={formatDateForInput(endDate)}
                  onChange={handleEndDateChange}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <button 
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded"
                onClick={() => setIsOpen(false)}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;