import { motion } from "framer-motion";

const bandMembers = [
  {
    id: 1,
    name: "ALEX SKYWALKER",
    role: "LEAD VOCALS",
    description: "The anxious superhero with a voice that channels millennial angst into anthemic choruses",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
  },
  {
    id: 2,
    name: "PENNY PANICK",
    role: "RHYTHM GUITAR",
    description: "Band mascot and comedic anxiety representation with killer riffs and infectious energy",
    imageUrl: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
  },
  {
    id: 3,
    name: "JAX",
    role: "LEAD GUITAR",
    description: "Lead guitarist with pure punk aesthetic and solos that cut through the noise",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
  },
  {
    id: 4,
    name: "ZEE",
    role: "BASS GUITAR",
    description: "Non-binary bassist with cool presence and bass lines that anchor the chaos",
    imageUrl: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
  },
];

export default function Band() {
  return (
    <section id="band" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black tracking-widest mb-4">
            THE BAND
          </h2>
          <p className="text-muted-foreground text-lg">
            Meet the anxious superheroes behind the music
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {bandMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center group"
              data-testid={`band-member-${member.id}`}
            >
              <div className="relative mb-6 mx-auto w-48 h-48 rounded-full overflow-hidden border-4 border-primary group-hover:border-accent transition-colors duration-300">
                <img
                  src={member.imageUrl}
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
              <h3 className="text-xl font-bold mb-2">{member.name}</h3>
              <p className="text-primary font-semibold mb-2">{member.role}</p>
              <p className="text-muted-foreground text-sm">{member.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}