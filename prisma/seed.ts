import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const products = [
    {
      slug: "gulab-jamun",
      name: "Gulab Jamun",
      shortDesc: "Soft, syrup-soaked perfection—warm, fragrant, and festival-ready.",
      longDesc:
        "Our Gulab Jamun is hand-rolled in small batches for a cloud-soft center and a delicate golden finish. Soaked slowly in rose-kissed syrup with subtle cardamom for a clean, premium sweetness—never greasy, never overly sweet.",
      imageUrl: "/gulab-jamun.jpg", 
      isEggless: true,
      containsDairy: true,
      containsNuts: false,
      pricePerPiece: 199,
      price6Pack: 1099,
      price12Pack: 1999
    },
    {
      slug: "kaal-jamun",
      name: "Kaal Jamun",
      shortDesc: "Deeper caramel notes, richer finish—an indulgent classic.",
      longDesc:
        "Kaal Jamun brings a darker, more complex flavor with deeper caramelization and a richer, syrupy finish. Crafted for a smooth bite and a luxurious mouthfeel—perfect for celebrations or a premium dessert box.",
      imageUrl: "/kaal-jamun.jpg", 
      isEggless: true,
      containsDairy: true,
      containsNuts: false,
      pricePerPiece: 219,
      price6Pack: 1199,
      price12Pack: 2199
    }
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: p,
      create: p
    });
  }

  // Default settings
  await prisma.setting.upsert({
    where: { key: "payment_handles" },
    update: {},
    create: {
      key: "payment_handles",
      valueJson: JSON.stringify({
        zelleHandle: "your-zelle@email.com",
        venmoHandle: "@yourvenmo"
      })
    }
  });

  await prisma.setting.upsert({
    where: { key: "service_area" },
    update: {},
    create: {
      key: "service_area",
      valueJson: JSON.stringify({
        text: "Bothell • Snohomish County • Bellevue • Redmond"
      })
    }
  });

  await prisma.setting.upsert({
    where: { key: "time_windows" },
    update: {},
    create: {
      key: "time_windows",
      valueJson: JSON.stringify({
        pickup: ["12:00–2:00 PM", "4:00–6:00 PM"],
        delivery: ["2:00–5:00 PM", "5:00–7:00 PM"],
        shipping: ["All day"]
      })
    }
  });

  await prisma.setting.upsert({
    where: { key: "shipping_disclaimer" },
    update: {},
    create: {
      key: "shipping_disclaimer",
      valueJson: JSON.stringify({
        text:
          "Shipping is available with careful packaging. Delivery times vary by carrier and weather. We cannot guarantee arrival times; please order early for gifts and events."
      })
    }
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });