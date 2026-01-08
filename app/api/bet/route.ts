import { NextRequest, NextResponse } from "next/server";
import { createBet, saveBetToDatabase } from "@/lib/betsDB";
import { Bet } from "@/types/bet";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const {
      eventId,
      eventName,
      eventCategory,
      eventDate,
      outcomeId,
      outcomeName,
      odds,
    } = body;

    if (
      !eventId ||
      !eventName ||
      !eventCategory ||
      !eventDate ||
      !outcomeId ||
      !outcomeName ||
      typeof odds !== "number"
    ) {
      return NextResponse.json(
        {
          error: "Missing required fields. Required: eventId, eventName, eventCategory, eventDate, outcomeId, outcomeName, odds",
        },
        { status: 400 }
      );
    }

    // Validate odds is a positive number
    if (odds <= 0) {
      return NextResponse.json(
        { error: "Odds must be a positive number" },
        { status: 400 }
      );
    }

    // Create the bet object
    const bet: Bet = createBet(
      eventId,
      eventName,
      eventCategory,
      eventDate,
      outcomeId,
      outcomeName,
      odds
    );

    // Save to database
    await saveBetToDatabase(bet);

    return NextResponse.json(
      { success: true, bet },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating bet:", error);
    
    // Handle Prisma errors
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

