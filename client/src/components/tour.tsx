import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface TourDate {
  date: string;
  venue: string;
  location: string;
  time: string;
  available: boolean;
}

const tourDates: TourDate[] = [
  {
    date: "MAR 15",
    venue: "THE FILLMORE",
    location: "San Francisco, CA",
    time: "8:00 PM • All Ages",
    available: true,
  },
  {
    date: "MAR 22",
    venue: "HOLLYWOOD PALLADIUM",
    location: "Los Angeles, CA",
    time: "7:30 PM • All Ages",
    available: true,
  },
  {
    date: "APR 05",
    venue: "MUSIC HALL OF WILLIAMSBURG",
    location: "Brooklyn, NY",
    time: "8:00 PM • 18+",
    available: true,
  },
  {
    date: "FEB 28",
    venue: "SOLD OUT - THE ROXY",
    location: "West Hollywood, CA",
    time: "Sold Out Show",
    available: false,
  },
  {
    date: "FEB 14",
    venue: "SOLD OUT - THE INDEPENDENT",
    location: "San Francisco, CA",
    time: "Valentine's Day Special",
    available: false,
  },
];

export default function Tour() {
  const scrollToContact = () => {
    const element = document.getElementById("contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section id="tour" className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black tracking-widest mb-4">
            TOUR DATES
          </h2>
          <p className="text-muted-foreground text-lg">
            Catch us live and experience the anxiety in person
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {tourDates.map((show, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card
                className={`p-6 mb-4 flex flex-col md:flex-row md:items-center justify-between transition-colors ${
                  show.available 
                    ? 'hover:border-primary bg-card border-border' 
                    : 'opacity-60 bg-muted border-border'
                }`}
                data-testid={`tour-date-${index}`}
              >
                <div className="flex-1 mb-4 md:mb-0">
                  <div className="flex items-center gap-4 mb-2">
                    <span
                      className={`px-3 py-1 rounded text-sm font-bold ${
                        show.available
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted-foreground text-background'
                      }`}
                    >
                      {show.date}
                    </span>
                    <h3 className="text-xl font-bold">{show.venue}</h3>
                  </div>
                  <p className="text-muted-foreground">{show.location}</p>
                  <p className="text-sm text-muted-foreground mt-1">{show.time}</p>
                </div>
                {show.available ? (
                  <Button
                    className="bg-primary hover:bg-accent text-primary-foreground"
                    data-testid={`tour-tickets-${index}`}
                  >
                    GET TICKETS
                  </Button>
                ) : (
                  <span className="text-muted-foreground font-semibold">SOLD OUT</span>
                )}
              </Card>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <p className="text-muted-foreground mb-4">
              Want to be the first to know about new tour dates?
            </p>
            <Button
              className="bg-accent hover:bg-primary text-accent-foreground"
              onClick={scrollToContact}
              data-testid="tour-mailing-list-button"
            >
              JOIN OUR MAILING LIST
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
