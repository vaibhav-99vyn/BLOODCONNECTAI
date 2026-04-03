// ============================================================
// ai-predictor.js — AI-Powered Blood Demand Prediction Engine
// ============================================================

const AIPredictor = {

  // Historical data patterns for prediction
  historicalPatterns: {
    seasonal: {
      'Jan': 1.2, 'Feb': 1.1, 'Mar': 1.0, 'Apr': 0.9, 'May': 0.8, 'Jun': 0.9,
      'Jul': 1.1, 'Aug': 1.3, 'Sep': 1.2, 'Oct': 1.0, 'Nov': 1.1, 'Dec': 1.4
    },
    weekly: {
      'Mon': 1.0, 'Tue': 0.9, 'Wed': 0.8, 'Thu': 1.1, 'Fri': 1.2, 'Sat': 1.3, 'Sun': 1.4
    },
    events: {
      'festival': 1.5, 'accident': 2.0, 'disaster': 3.0, 'sports': 1.3, 'concert': 1.2
    }
  },

  // Machine learning prediction model
  predictDemand(bloodGroup, daysAhead = 7) {
    const now = new Date();
    const predictions = [];

    // Get historical data
    const historicalData = this.getHistoricalDemand(bloodGroup);

    for (let i = 1; i <= daysAhead; i++) {
      const futureDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      const dayName = futureDate.toLocaleDateString('en-US', { weekday: 'short' });
      const monthName = futureDate.toLocaleDateString('en-US', { month: 'short' });

      // Base prediction from historical average
      let baseDemand = historicalData.average || 5;

      // Apply seasonal multiplier
      const seasonalMult = this.historicalPatterns.seasonal[monthName] || 1.0;
      baseDemand *= seasonalMult;

      // Apply weekly pattern
      const weeklyMult = this.historicalPatterns.weekly[dayName] || 1.0;
      baseDemand *= weeklyMult;

      // Apply event-based multipliers (simulated)
      const eventMult = this.getEventMultiplier(futureDate);
      baseDemand *= eventMult;

      // Add some AI "noise" to make it realistic
      const aiAdjustment = this.applyAIAdjustment(baseDemand, historicalData);

      predictions.push({
        date: futureDate.toISOString().split('T')[0],
        day: dayName,
        bloodGroup: bloodGroup,
        predictedDemand: Math.round(baseDemand + aiAdjustment),
        confidence: this.calculateConfidence(historicalData, i),
        factors: {
          seasonal: seasonalMult,
          weekly: weeklyMult,
          events: eventMult
        }
      });
    }

    return predictions;
  },

  // Get historical demand data for a blood group
  getHistoricalDemand(bloodGroup) {
    const donations = DB.getDonations();
    const requests = DB.getRequests();

    // Calculate average demand over last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentRequests = requests.filter(r =>
      new Date(r.createdAt) > thirtyDaysAgo && r.bloodGroup === bloodGroup
    );

    const average = recentRequests.length > 0 ?
      recentRequests.reduce((sum, r) => sum + r.units, 0) / 30 : 3;

    return {
      average: average,
      totalRequests: recentRequests.length,
      trend: this.calculateTrend(recentRequests)
    };
  },

  // Calculate demand trend
  calculateTrend(recentRequests) {
    if (recentRequests.length < 7) return 'stable';

    const firstWeek = recentRequests.slice(0, Math.floor(recentRequests.length / 2));
    const secondWeek = recentRequests.slice(Math.floor(recentRequests.length / 2));

    const firstWeekAvg = firstWeek.reduce((sum, r) => sum + r.units, 0) / firstWeek.length;
    const secondWeekAvg = secondWeek.reduce((sum, r) => sum + r.units, 0) / secondWeek.length;

    const change = ((secondWeekAvg - firstWeekAvg) / firstWeekAvg) * 100;

    if (change > 20) return 'increasing';
    if (change < -20) return 'decreasing';
    return 'stable';
  },

  // Simulate event-based demand spikes
  getEventMultiplier(date) {
    // Simulate random events (in real system, this would come from external APIs)
    const events = ['festival', 'sports', 'concert', 'accident'];
    const randomEvent = events[Math.floor(Math.random() * events.length)];

    // 30% chance of an event
    if (Math.random() < 0.3) {
      return this.historicalPatterns.events[randomEvent] || 1.0;
    }

    return 1.0;
  },

  // Apply AI adjustment based on patterns
  applyAIAdjustment(baseDemand, historicalData) {
    let adjustment = 0;

    // Trend-based adjustment
    if (historicalData.trend === 'increasing') adjustment += baseDemand * 0.2;
    else if (historicalData.trend === 'decreasing') adjustment -= baseDemand * 0.1;

    // Add some machine learning "magic" - correlation with emergencies
    const emergencies = DB.getEmergencies();
    const recentEmergencies = emergencies.filter(e =>
      new Date(e.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );

    if (recentEmergencies.length > 2) {
      adjustment += baseDemand * 0.3; // Emergency correlation
    }

    // Add random noise to simulate real-world unpredictability
    adjustment += (Math.random() - 0.5) * baseDemand * 0.1;

    return adjustment;
  },

  // Calculate prediction confidence
  calculateConfidence(historicalData, daysAhead) {
    let confidence = 80; // Base confidence

    // Reduce confidence for longer predictions
    confidence -= daysAhead * 2;

    // Increase confidence with more historical data
    if (historicalData.totalRequests > 10) confidence += 10;
    if (historicalData.totalRequests > 50) confidence += 10;

    // Reduce confidence for volatile trends
    if (historicalData.trend !== 'stable') confidence -= 15;

    return Math.max(50, Math.min(95, confidence));
  },

  // Emergency response optimization
  optimizeEmergencyResponse(emergency) {
    const bloodGroup = emergency.bloodGroup;
    const location = emergency.location;

    // Find optimal donors (closest, compatible blood types, recent donors)
    const compatibleDonors = this.findCompatibleDonors(bloodGroup, location);

    // Find nearest blood banks with stock
    const nearbyBanks = this.findNearbyBloodBanks(location, bloodGroup);

    // Calculate optimal response strategy
    const strategy = {
      primaryAction: this.determinePrimaryAction(emergency, compatibleDonors, nearbyBanks),
      alternativeActions: this.getAlternativeActions(emergency),
      estimatedTime: this.calculateResponseTime(compatibleDonors, nearbyBanks),
      successProbability: this.calculateSuccessProbability(compatibleDonors, nearbyBanks),
      recommendations: this.generateRecommendations(emergency, compatibleDonors, nearbyBanks)
    };

    return {
      emergency: emergency,
      compatibleDonors: compatibleDonors,
      nearbyBanks: nearbyBanks,
      strategy: strategy
    };
  },

  // Find compatible donors for emergency
  findCompatibleDonors(bloodGroup, location) {
    const donors = DB.getUsersByRole('donor');
    const compatibleTypes = this.getCompatibleBloodTypes(bloodGroup);

    return donors
      .filter(donor => compatibleTypes.includes(donor.bloodGroup))
      .filter(donor => {
        // Check if donor can donate (3-month cooldown)
        if (donor.lastDonated) {
          const lastDate = new Date(donor.lastDonated);
          const nextDate = new Date(lastDate.getTime() + 90 * 24 * 60 * 60 * 1000);
          return new Date() > nextDate;
        }
        return true;
      })
      .map(donor => ({
        ...donor,
        distance: this.calculateDistance(location, donor.location || 'Unknown'),
        compatibility: this.getCompatibilityScore(bloodGroup, donor.bloodGroup)
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10); // Top 10 closest
  },

  // Get blood type compatibility
  getCompatibleBloodTypes(targetType) {
    const compatibility = {
      'A+': ['A+', 'A-', 'O+', 'O-'],
      'A-': ['A-', 'O-'],
      'B+': ['B+', 'B-', 'O+', 'O-'],
      'B-': ['B-', 'O-'],
      'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      'AB-': ['AB-', 'A-', 'B-', 'O-'],
      'O+': ['O+', 'O-'],
      'O-': ['O-']
    };
    return compatibility[targetType] || [targetType];
  },

  // Find nearby blood banks
  findNearbyBloodBanks(location, bloodGroup) {
    const banks = DB.getUsersByRole('bloodbank');
    const stock = DB.getStock();

    return banks
      .map(bank => {
        const bankStock = stock.filter(s => s.ownerId === bank.id && s.bloodGroup === bloodGroup);
        const totalUnits = bankStock.reduce((sum, s) => sum + s.units, 0);

        return {
          ...bank,
          distance: this.calculateDistance(location, bank.location || 'Unknown'),
          availableUnits: totalUnits,
          hasStock: totalUnits > 0
        };
      })
      .filter(bank => bank.hasStock)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5); // Top 5 closest with stock
  },

  // Calculate distance (simplified - in real system use Google Maps API)
  calculateDistance(loc1, loc2) {
    // Simplified distance calculation
    if (loc1 === loc2) return 0;
    if (loc1 === 'Unknown' || loc2 === 'Unknown') return 999;

    // Mock distance based on location similarity
    const locations = ['Downtown', 'North', 'South', 'East', 'West', 'Central'];
    const loc1Index = locations.findIndex(l => loc1.includes(l));
    const loc2Index = locations.findIndex(l => loc2.includes(l));

    if (loc1Index >= 0 && loc2Index >= 0) {
      return Math.abs(loc1Index - loc2Index) * 5; // 5km per zone difference
    }

    return Math.floor(Math.random() * 20) + 5; // Random 5-25km
  },

  // Get compatibility score
  getCompatibilityScore(targetType, donorType) {
    const perfect = targetType === donorType ? 100 : 0;
    const universal = ['O-', 'O+'].includes(donorType) ? 80 : 0;
    return perfect || universal || 60;
  },

  // Determine primary action for emergency
  determinePrimaryAction(emergency, donors, banks) {
    if (banks.length > 0 && banks[0].distance < 10) {
      return 'dispatch_from_blood_bank';
    }

    if (donors.length > 0 && donors[0].distance < 15) {
      return 'contact_nearby_donors';
    }

    return 'broadcast_emergency_alert';
  },

  // Get alternative actions
  getAlternativeActions(emergency) {
    return [
      'Contact regional blood banks',
      'Activate emergency donor network',
      'Coordinate with nearby hospitals',
      'Prepare for inter-hospital transfer'
    ];
  },

  // Calculate estimated response time
  calculateResponseTime(donors, banks) {
    const closestDonor = donors.length > 0 ? donors[0].distance : 999;
    const closestBank = banks.length > 0 ? banks[0].distance : 999;

    const minDistance = Math.min(closestDonor, closestBank);
    const baseTime = 30; // 30 minutes base
    const travelTime = minDistance * 2; // 2 minutes per km

    return Math.round(baseTime + travelTime);
  },

  // Calculate success probability
  calculateSuccessProbability(donors, banks) {
    let probability = 50; // Base 50%

    if (banks.length > 0) probability += 30;
    if (donors.length > 2) probability += 20;
    if (donors.length > 0 && donors[0].distance < 10) probability += 15;

    return Math.min(95, probability);
  },

  // Generate AI recommendations
  generateRecommendations(emergency, donors, banks) {
    const recommendations = [];

    if (banks.length === 0) {
      recommendations.push('⚠️ Critical: No nearby blood banks have required blood type');
    }

    if (donors.length < 3) {
      recommendations.push('📢 Activate emergency donor recruitment campaign');
    }

    if (emergency.urgency === 'critical') {
      recommendations.push('🚁 Consider air ambulance for blood transport if distance > 50km');
    }

    recommendations.push('📊 Monitor real-time stock levels across network');
    recommendations.push('🔄 Prepare contingency plans for blood type alternatives');

    return recommendations;
  },

  // Get system-wide predictions
  getSystemPredictions() {
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const predictions = {};

    bloodGroups.forEach(group => {
      predictions[group] = this.predictDemand(group, 3); // 3-day prediction
    });

    return predictions;
  },

  // Get emergency optimization for active emergencies
  getEmergencyOptimizations() {
    const emergencies = DB.getEmergencies().filter(e => e.status === 'active');
    return emergencies.map(e => this.optimizeEmergencyResponse(e));
  }
};