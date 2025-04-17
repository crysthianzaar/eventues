'use client';

import { Box, Typography, Tabs, Tab } from '@mui/material';
import QRCode from 'react-qr-code';
import { useState } from 'react';
import { TicketItem } from '../types';

interface TicketQRCodeProps {
  tickets: TicketItem[];
}

const TicketQRCode = ({ tickets }: TicketQRCodeProps) => {
  const [activeTab, setActiveTab] = useState(0);

  if (!tickets || tickets.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        Nenhum ingresso encontrado
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1,
        height: '100%',
        minHeight: 200,
      }}
    >
      {tickets.length > 1 ? (
        <>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 2, width: '100%' }}
          >
            {tickets.map((ticket, index) => (
              <Tab 
                key={index} 
                label={`Ingresso ${index + 1}`} 
                sx={{ fontWeight: 500 }}
              />
            ))}
          </Tabs>
          <Box sx={{ mt: 2, width: '100%', textAlign: 'center' }}>
            {tickets[activeTab] && (
              <>
                <QRCode 
                  value={tickets[activeTab].qr_code_uuid} 
                  size={128} 
                />
                <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                  {tickets[activeTab].participants[0]?.fullName || 'Sem nome'}
                </Typography>
              </>
            )}
          </Box>
        </>
      ) : (
        <>
          <QRCode 
            value={tickets[0].qr_code_uuid} 
            size={128} 
          />
          <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
            {tickets[0].participants[0]?.fullName || 'Sem nome'}
          </Typography>
        </>
      )}
    </Box>
  );
};

export default TicketQRCode;
