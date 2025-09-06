import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Clock, Users, ExternalLink, Ticket, Zap, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TourDate {
  id: string;
  date: string;
  venue: string;
  city: string;
  state: string;
  coordinates: { x: number; y: number }; // Relative to map container
  capacity: number;
  soldOut: boolean;
  ticketsAvailable: number;
  ticketUrl: string;
  venueImage: string;
  description: string;
  showTime: string;
  doors: string;
  ages: string;
  specialNotes?: string[];
}

const tourDates: TourDate[] = [
  {
    id: 'sf-fillmore',
    date: '2024-03-15',
    venue: 'The Fillmore',
    city: 'San Francisco',
    state: 'CA',
    coordinates: { x: 5, y: 35 },
    capacity: 1150,
    soldOut: false,
    ticketsAvailable: 127,
    ticketUrl: 'https://ticketmaster.com/example-sf',
    venueImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400',
    description: 'Historic venue in the heart of SF with incredible acoustics',
    showTime: '8:00 PM',
    doors: '7:00 PM',
    ages: 'All Ages'
  },
  {
    id: 'la-palladium',
    date: '2024-03-22',
    venue: 'Hollywood Palladium',
    city: 'Los Angeles',
    state: 'CA',
    coordinates: { x: 8, y: 60 },
    capacity: 3500,
    soldOut: false,
    ticketsAvailable: 892,
    ticketUrl: 'https://ticketmaster.com/example-la',
    venueImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    description: 'Legendary Hollywood venue - this is going to be HUGE!',
    showTime: '7:30 PM',
    doors: '6:30 PM',
    ages: 'All Ages',
    specialNotes: ['VIP packages available', 'Meet & greet opportunities']
  },
  {
    id: 'nyc-williamsburg',
    date: '2024-04-05',
    venue: 'Music Hall of Williamsburg',
    city: 'Brooklyn',
    state: 'NY',
    coordinates: { x: 85, y: 25 },
    capacity: 550,
    soldOut: false,
    ticketsAvailable: 43,
    ticketUrl: 'https://ticketmaster.com/example-nyc',
    venueImage: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400',
    description: 'Intimate Brooklyn venue - our most personal show',
    showTime: '8:00 PM',
    doors: '7:30 PM',
    ages: '18+',
    specialNotes: ['Limited capacity - almost sold out!']
  },
  {
    id: 'chi-metro',
    date: '2024-04-12',
    venue: 'Metro Chicago',
    city: 'Chicago',
    state: 'IL',
    coordinates: { x: 60, y: 35 },
    capacity: 1100,
    soldOut: true,
    ticketsAvailable: 0,
    ticketUrl: '',
    venueImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400',
    description: 'SOLD OUT - Check for last minute releases!',
    showTime: '8:00 PM',
    doors: '7:30 PM',
    ages: '18+',
    specialNotes: ['SOLD OUT', 'Follow @panickinskywalker for last-minute tickets']
  },
  {
    id: 'austin-stubb',
    date: '2024-04-18',
    venue: "Stubb's Bar-B-Q",
    city: 'Austin',
    state: 'TX',
    coordinates: { x: 45, y: 70 },
    capacity: 2200,
    soldOut: false,
    ticketsAvailable: 567,
    ticketUrl: 'https://ticketmaster.com/example-austin',
    venueImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400',
    description: 'Outdoor amphitheater in the heart of Austin - BBQ and punk rock!',
    showTime: '8:30 PM',
    doors: '7:00 PM',
    ages: 'All Ages',
    specialNotes: ['Outdoor venue', 'Food available']
  }
];

interface InteractiveTourMapProps {
  className?: string;
  showControls?: boolean;
  autoRotate?: boolean;
}

export const InteractiveTourMap: React.FC<InteractiveTourMapProps> = ({
  className,
  showControls = true,
  autoRotate = false
}) => {
  const [selectedShow, setSelectedShow] = useState<TourDate | null>(null);
  const [hoveredShow, setHoveredShow] = useState<string | null>(null);
  const [mapView, setMapView] = useState<'us' | 'world'>('us');
  const mapRef = useRef<HTMLDivElement>(null);

  // Auto-rotate through shows
  useEffect(() => {
    if (!autoRotate) return;
    
    const interval = setInterval(() => {
      const currentIndex = selectedShow ? tourDates.findIndex(show => show.id === selectedShow.id) : -1;
      const nextIndex = (currentIndex + 1) % tourDates.length;
      setSelectedShow(tourDates[nextIndex]);
    }, 4000);

    return () => clearInterval(interval);
  }, [selectedShow, autoRotate]);

  const handleShowClick = (show: TourDate) => {
    setSelectedShow(show);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    }).toUpperCase();
  };

  const getAvailabilityColor = (show: TourDate) => {
    if (show.soldOut) return 'bg-destructive';
    if (show.ticketsAvailable < 100) return 'bg-warning';
    return 'bg-primary';
  };

  const getAvailabilityText = (show: TourDate) => {
    if (show.soldOut) return 'SOLD OUT';
    if (show.ticketsAvailable < 100) return 'Almost Sold Out';
    return 'Tickets Available';
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Map Controls */}
      {showControls && (
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <Button
              variant={mapView === 'us' ? 'default' : 'outline'}
              onClick={() => setMapView('us')}
              size="sm"
            >
              US Tour
            </Button>
            <Button
              variant={mapView === 'world' ? 'default' : 'outline'}
              onClick={() => setMapView('world')}
              size="sm"
              disabled
            >
              World Tour (Coming Soon)
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-xs">Available</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-warning rounded-full"></div>
              <span className="text-xs">Almost Sold Out</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-destructive rounded-full"></div>
              <span className="text-xs">Sold Out</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map */}
        <div className="lg:col-span-2">
          <Card className="bg-card border border-border">
            <CardContent className="p-0 relative overflow-hidden">
              <div 
                ref={mapRef}
                className="relative w-full h-96 bg-gradient-to-br from-primary/5 to-accent/10"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23330066' fill-opacity='0.05'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}
              >
                {/* Animated background pattern */}
                <motion.div
                  className="absolute inset-0 opacity-20"
                  animate={{
                    backgroundPosition: ['0px 0px', '60px 60px'],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 15m-4 0a4 4 0 1 1 8 0a4 4 0 1 1 -8 0' fill='none' stroke='%23330066' stroke-width='1' opacity='0.1'/%3E%3C/svg%3E")`,
                    backgroundSize: '30px 30px'
                  }}
                />

                {/* Tour route lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <defs>
                    <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="hsl(330 100% 55%)" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="hsl(270 100% 55%)" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>
                  
                  {tourDates.slice(0, -1).map((show, index) => {
                    const nextShow = tourDates[index + 1];
                    if (!nextShow) return null;
                    
                    const x1 = `${show.coordinates.x}%`;
                    const y1 = `${show.coordinates.y}%`;
                    const x2 = `${nextShow.coordinates.x}%`;
                    const y2 = `${nextShow.coordinates.y}%`;
                    
                    return (
                      <motion.line
                        key={`route-${show.id}`}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="url(#routeGradient)"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1, delay: index * 0.2 }}
                      />
                    );
                  })}
                </svg>

                {/* Tour location markers */}
                {tourDates.map((show, index) => (
                  <motion.div
                    key={show.id}
                    className="absolute cursor-pointer group"
                    style={{
                      left: `${show.coordinates.x}%`,
                      top: `${show.coordinates.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    onMouseEnter={() => setHoveredShow(show.id)}
                    onMouseLeave={() => setHoveredShow(null)}
                    onClick={() => handleShowClick(show)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {/* Pulsing ring for selected show */}
                    {(selectedShow?.id === show.id || hoveredShow === show.id) && (
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-primary"
                        initial={{ scale: 1, opacity: 0.5 }}
                        animate={{ scale: 2, opacity: 0 }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}

                    {/* Main marker */}
                    <motion.div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center shadow-lg",
                        "border-2 border-white relative z-10",
                        getAvailabilityColor(show),
                        selectedShow?.id === show.id && "ring-2 ring-primary ring-offset-2"
                      )}
                      animate={selectedShow?.id === show.id ? {
                        scale: [1, 1.1, 1],
                      } : {}}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      {show.soldOut ? (
                        <X className="w-3 h-3 text-white" />
                      ) : (
                        <MapPin className="w-3 h-3 text-white" />
                      )}
                    </motion.div>

                    {/* Hover tooltip */}
                    <AnimatePresence>
                      {hoveredShow === show.id && (
                        <motion.div
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-card border border-border rounded-lg shadow-lg whitespace-nowrap z-20"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                        >
                          <div className="text-sm font-semibold">{show.city}</div>
                          <div className="text-xs text-muted-foreground">{formatDate(show.date)}</div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* City label */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-xs font-medium text-center">
                      <div className="text-foreground">{show.city}</div>
                      <div className="text-xs text-muted-foreground">{formatDate(show.date)}</div>
                    </div>
                  </motion.div>
                ))}

                {/* Animated tour path */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.1 }}
                  transition={{ duration: 1 }}
                >
                  {/* Additional visual effects could go here */}
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Show Details Panel */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedShow ? (
              <motion.div
                key={selectedShow.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-card border border-border">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Venue Image */}
                      <div className="relative w-full h-32 rounded-lg overflow-hidden">
                        <img 
                          src={selectedShow.venueImage} 
                          alt={selectedShow.venue}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-2 left-2 right-2">
                          <Badge variant="secondary" className="mb-1">
                            {getAvailabilityText(selectedShow)}
                          </Badge>
                        </div>
                      </div>

                      {/* Show Info */}
                      <div>
                        <h3 className="text-xl font-bold mb-2">{selectedShow.venue}</h3>
                        <p className="text-muted-foreground mb-1">
                          {selectedShow.city}, {selectedShow.state}
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">
                          {selectedShow.description}
                        </p>
                      </div>

                      {/* Event Details */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span>{formatDate(selectedShow.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-primary" />
                          <span>Doors: {selectedShow.doors} • Show: {selectedShow.showTime}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-primary" />
                          <span>{selectedShow.ages} • Capacity: {selectedShow.capacity.toLocaleString()}</span>
                        </div>
                        {!selectedShow.soldOut && (
                          <div className="flex items-center gap-2 text-sm">
                            <Ticket className="w-4 h-4 text-primary" />
                            <span>{selectedShow.ticketsAvailable} tickets available</span>
                          </div>
                        )}
                      </div>

                      {/* Special Notes */}
                      {selectedShow.specialNotes && selectedShow.specialNotes.length > 0 && (
                        <div className="space-y-1">
                          {selectedShow.specialNotes.map((note, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs">
                              <Zap className="w-3 h-3 text-accent" />
                              <span className="text-muted-foreground">{note}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Action Button */}
                      <Button
                        className="w-full"
                        disabled={selectedShow.soldOut}
                        onClick={() => {
                          if (selectedShow.ticketUrl) {
                            window.open(selectedShow.ticketUrl, '_blank');
                          }
                        }}
                      >
                        {selectedShow.soldOut ? (
                          'SOLD OUT'
                        ) : (
                          <>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            GET TICKETS
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="no-selection"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="bg-card border border-border">
                  <CardContent className="p-6 text-center">
                    <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Select a Tour Date</h3>
                    <p className="text-muted-foreground text-sm">
                      Click on any location marker to see show details and get tickets
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Tour Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <Card className="bg-card/50 border border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{tourDates.length}</div>
            <div className="text-xs text-muted-foreground">Cities</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {tourDates.filter(show => show.soldOut).length}
            </div>
            <div className="text-xs text-muted-foreground">Sold Out</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {tourDates.reduce((sum, show) => sum + show.capacity, 0).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Total Capacity</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {tourDates.reduce((sum, show) => sum + show.ticketsAvailable, 0).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Tickets Left</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InteractiveTourMap;