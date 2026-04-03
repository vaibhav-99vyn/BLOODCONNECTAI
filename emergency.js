// ============================================================
// emergency.js — Emergency Request & Location Logic
// ============================================================

const Emergency = {

  // Haversine formula: distance between two lat/lng points in km
  distance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  },

  // Get current location via Geolocation API
  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported by this browser.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        err => reject(err),
        { timeout: 10000 }
      );
    });
  },

  // Find nearby sources for a blood group within radiusKm
  findNearbySources(patientLat, patientLng, bloodGroup, radiusKm = 50) {
    const results = [];

    // Check hospitals
    const hospitals = DB.getUsersByRole('hospital');
    hospitals.forEach(h => {
      if (!h.lat || !h.lng) return;
      const dist = this.distance(patientLat, patientLng, h.lat, h.lng);
      if (dist <= radiusKm) {
        const stock = DB.getStockByOwner(h.id).find(s => s.bloodGroup === bloodGroup);
        if (stock && stock.units > 0) {
          results.push({
            type: 'Hospital',
            id: h.id,
            name: h.name,
            address: h.address,
            phone: h.phone,
            email: h.email,
            distanceKm: dist.toFixed(1),
            units: stock.units,
            bloodGroup
          });
        }
      }
    });

    // Check blood banks
    const banks = DB.getUsersByRole('bloodbank');
    banks.forEach(b => {
      if (!b.lat || !b.lng) return;
      const dist = this.distance(patientLat, patientLng, b.lat, b.lng);
      if (dist <= radiusKm) {
        const stock = DB.getStockByOwner(b.id).find(s => s.bloodGroup === bloodGroup);
        if (stock && stock.units > 0) {
          results.push({
            type: 'Blood Bank',
            id: b.id,
            name: b.name,
            address: b.address,
            phone: b.phone,
            email: b.email,
            distanceKm: dist.toFixed(1),
            units: stock.units,
            bloodGroup
          });
        }
      }
    });

    // Check available donors
    const donors = DB.getUsersByRole('donor').filter(d => d.available && d.bloodGroup === bloodGroup);
    donors.forEach(d => {
      if (!d.lat || !d.lng) return;
      const dist = this.distance(patientLat, patientLng, d.lat, d.lng);
      if (dist <= radiusKm) {
        results.push({
          type: 'Donor',
          id: d.id,
          name: d.name,
          phone: d.phone,
          email: d.email,
          distanceKm: dist.toFixed(1),
          units: 1,
          bloodGroup: d.bloodGroup
        });
      }
    });

    // Sort by distance
    results.sort((a, b) => parseFloat(a.distanceKm) - parseFloat(b.distanceKm));
    return results;
  },

  // Raise emergency request and simulate notification
  raiseEmergencyRequest(patient, bloodGroup, units, sources, patientLat, patientLng) {
    const emergency = DB.addEmergency({
      patientId: patient.id,
      patientName: patient.name,
      patientEmail: patient.email,
      patientPhone: patient.phone,
      bloodGroup,
      unitsNeeded: units,
      patientLat,
      patientLng,
      sourcesAlerted: sources.map(s => ({ id: s.id, type: s.type, name: s.name, email: s.email, phone: s.phone })),
      notificationSent: true
    });

    // Simulate email/SMS notifications (console log + alert)
    sources.forEach(source => {
      console.log(`[EMAIL SENT] To: ${source.email} | Subject: EMERGENCY Blood Request`);
      console.log(`[SMS SENT] To: ${source.phone} | Message: Emergency! ${patient.name} needs ${units} unit(s) of ${bloodGroup}. Contact: ${patient.phone}`);
    });

    // Also create a blood request
    DB.addRequest({
      patientId: patient.id,
      patientName: patient.name,
      bloodGroup,
      units,
      urgency: 'emergency',
      patientLat,
      patientLng,
      notes: 'Auto-raised via emergency system',
      emergencyId: emergency.id
    });

    return emergency;
  },

  // Simulate EmailJS (requires EmailJS setup for real emails)
  sendEmailViaEmailJS(toEmail, toName, subject, message) {
    // If you have EmailJS set up, replace with real emailjs.send() call
    // emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
    //   to_email: toEmail, to_name: toName, subject: subject, message: message
    // });
    console.log(`[SIMULATED EMAIL] To: ${toEmail} (${toName}) | Subject: ${subject} | Message: ${message}`);
  }
};
