import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { handler } from "../auth/[...nextauth]/route";
import { createBet } from "@/lib/betsDB";
import { Bet } from "@/types/bet";
import { prisma } from "@/lib/prisma";

const BET_COST = 100;

export async function POST(request: NextRequest) {
  try {
    // Get the current session
    const session: Session | null = await getServerSession(handler);

    // Check if user is authenticated
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user has enough money
    if (user.money < BET_COST) {
      return NextResponse.json(
        { error: `Insufficient funds. You need ${BET_COST} to place a bet. Current balance: ${user.money}` },
        { status: 400 }
      );
    }

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

    // Use a transaction to atomically create the bet and deduct money
    await prisma.$transaction(async (tx) => {
      // Create the bet
      await tx.bet.create({
        data: {
          id: bet.id,
          eventId: bet.eventId,
          eventName: bet.eventName,
          eventCategory: bet.eventCategory,
          eventDate: bet.eventDate,
          outcomeId: bet.outcomeId,
          outcomeName: bet.outcomeName,
          odds: bet.odds,
          placedAt: new Date(bet.placedAt),
          status: bet.status,
        },
      });

      // Deduct money from user
      await tx.user.update({
        where: { id: user.id },
        data: {
          money: {
            decrement: BET_COST,
          },
        },
      });
    });

    // Fetch updated user to return new balance
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { money: true },
    });

    return NextResponse.json(
      { 
        success: true, 
        bet,
        newBalance: updatedUser?.money ?? user.money - BET_COST,
      },
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

