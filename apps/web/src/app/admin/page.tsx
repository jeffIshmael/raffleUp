"use client";

import React, { useState } from "react";
import { useRaffles } from "@/hooks/useRaffles";
import { useWriteContract, useAccount, useReadContract } from "wagmi";
import { raffleUpAbi, raffleUpAddress } from "@/Constants/constants";
import { createRaffle } from "@/lib/prismaFunctions";
import { parseEther } from "viem";

interface CreateRaffleForm {
  name: string;
  description: string;
  ticketPrice: string;
  startDate: string;
  endDate: string;
  fromNumber: string;
  toNumber: string;
}

type TabType = "view" | "create" | "edit";

export default function AdminPage() {
  const { raffles, addTakenNumbers, updateRaffle } = useRaffles();
  const [activeTab, setActiveTab] = useState<TabType>("view");
  const [editingRaffleId, setEditingRaffleId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { data: totalRaffles } = useReadContract({
    address: raffleUpAddress,
    abi: raffleUpAbi,
    functionName: 'raffleCount',
  })

  const [formData, setFormData] = useState<CreateRaffleForm>({
    name: "",
    description: "",
    ticketPrice: "",
    startDate: "",
    endDate: "",
    fromNumber: "",
    toNumber: "",
  });

  const { writeContractAsync } = useWriteContract();
  const { address, isConnected } = useAccount();

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(""), 3000);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateRaffle = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      showError("Please connect your wallet.");
      return;
    }

    // Empty fields check
    if (
      !formData.name ||
      !formData.description ||
      !formData.ticketPrice ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.fromNumber ||
      !formData.toNumber
    ) {
      showError("Please fill in all required fields.");
      return;
    }

    // Convert numbers
    const fromNum = Number(formData.fromNumber);
    const toNum = Number(formData.toNumber);

    // Validate number range
    if (fromNum >= toNum) {
      showError("The 'From' number must be LOWER than the 'To' number.");
      return;
    }

    // Convert dates to UNIX timestamps
    const startDateTimestamp = Math.floor(
      new Date(formData.startDate).getTime() / 1000
    );
    const endDateTimestamp = Math.floor(
      new Date(formData.endDate).getTime() / 1000
    );

    // Validate date order
    if (startDateTimestamp >= endDateTimestamp) {
      showError("End date must be AFTER start date.");
      return;
    }

    try {
      setIsCreating(true);
      const ticketPriceWei = parseEther(formData.ticketPrice);


      // Write to the smart contract
      const txHash = await writeContractAsync({
        address: raffleUpAddress,
        abi: raffleUpAbi,
        functionName: "createRaffle",
        args: [
          BigInt(fromNum),
          BigInt(toNum),
          ticketPriceWei,
          BigInt(startDateTimestamp),
          BigInt(endDateTimestamp),
        ],
      });

      if (!txHash) {
        showError("Unable to create raffle.");
        return;
      }

      const from = Number(formData.fromNumber);
      const to = Number(formData.toNumber);
      const ticket = Number(formData.ticketPrice);

      const totalEntries = to - from + 1;

      // Calculate number of winners
      const winners = Math.ceil(totalEntries / 10); // 1 per 10 entries

      // Prize pool after 1% fee
      const totalPrizePool = totalEntries * ticket * 0.99;

      // Prize per winner
      const prizePerWinner = totalPrizePool / winners;

      const databaseParams = {
        title: formData.name,
        description: formData.description,
        expectedWinners: winners,
        winningPrice: prizePerWinner.toString(),
        blockchainId: totalRaffles ? Number(totalRaffles) + 1 : 0,
        ticketPrice: formData.ticketPrice,
        startNo: from,
        endNo: to,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        status: "not started",
      };

      console.log("registering to database...")

      // register to database
      const raffle = await createRaffle(databaseParams);
      if (!raffle) {
        throw new Error("unable to use prisama.");
        showError("Not able to create the raffle.");
        return;
      }

      showSuccess(`Raffle "${formData.name}" created successfully!`);
      console.log("Transaction Hash:", txHash);
    } catch (error: any) {
      console.error(error);
      showError(error?.message || "Error creating raffle.");
      return;
    } finally {
      setIsCreating(false);
    }

    // Reset form after success
    setFormData({
      name: "",
      description: "",
      ticketPrice: "",
      startDate: "",
      endDate: "",
      fromNumber: "",
      toNumber: "",
    });

    setActiveTab("view");
  };

  const handleDeleteRaffle = (raffleId: string) => {
    if (confirm("Are you sure you want to delete this raffle?")) {
      showSuccess("Raffle deleted successfully");
      // In a real app, you'd call an API to delete the raffle
    }
  };

  const handleSimulatePurchase = (raffleId: string) => {
    const randomNumbers = Array.from(
      { length: Math.floor(Math.random() * 5) + 1 },
      () => Math.floor(Math.random() * 50) + 1
    );

    const raffle = raffles.find((r) => r.id === raffleId);
    if (raffle) {
      const validNumbers = randomNumbers.filter(
        (num) => !raffle.takenNumbers.includes(num) && num <= raffle.numberRange
      );

      if (validNumbers.length > 0) {
        addTakenNumbers(raffleId, validNumbers);
        showSuccess(`Simulated purchase: ${validNumbers.length} numbers taken`);
      } else {
        showError("No valid numbers available for simulation");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">⚙️</span>
          <h1 className="text-4xl md:text-5xl font-bold text-amber-400">
            Admin Dashboard
          </h1>
        </div>
        <p className="text-gray-300 text-lg">
          Manage raffles, create new ones, and monitor activity
        </p>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-500 bg-opacity-10 border-2 border-green-500 rounded text-green-400 font-semibold flex items-center gap-2">
          <span>✓</span> {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-500 bg-opacity-10 border-2 border-red-500 rounded text-red-400 font-semibold flex items-center gap-2">
          <span>✕</span> {errorMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-amber-400 border-opacity-20">
        <button
          onClick={() => setActiveTab("view")}
          className={`px-6 py-3 font-semibold border-b-2 transition-all duration-300 ${
            activeTab === "view"
              ? "border-amber-400 text-amber-400"
              : "border-transparent text-gray-400 hover:text-amber-400"
          }`}
        >
          📊 View Raffles ({raffles.length})
        </button>
        <button
          onClick={() => setActiveTab("create")}
          className={`px-6 py-3 font-semibold border-b-2 transition-all duration-300 ${
            activeTab === "create"
              ? "border-amber-400 text-amber-400"
              : "border-transparent text-gray-400 hover:text-amber-400"
          }`}
        >
          ➕ Create Raffle
        </button>
      </div>

      {/* View Raffles Tab */}
      {activeTab === "view" && (
        <div className="space-y-6">
          {raffles.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-amber-400 border-opacity-30 rounded-lg">
              <p className="text-gray-400 text-lg mb-4">
                No raffles created yet
              </p>
              <button
                onClick={() => setActiveTab("create")}
                className="px-6 py-2 bg-amber-400 text-black font-semibold rounded hover:bg-amber-300 transition-colors"
              >
                Create Your First Raffle
              </button>
            </div>
          ) : (
            raffles.map((raffle) => {
              const progress = (
                (raffle.takenNumbers.length /
                  (raffle.numberRange - raffle.takenNumbers.length)) *
                100
              ).toFixed(1);
              const timeRemaining =
                new Date(raffle.endsAt).getTime() - Date.now();
              const isEnded = timeRemaining <= 0;

              return (
                <div
                  key={raffle.id}
                  className="border-2 border-amber-400 border-opacity-30 rounded-lg p-6 bg-black bg-opacity-50 hover:border-opacity-60 transition-all duration-300"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-amber-400 mb-2">
                        {raffle.name}
                      </h3>
                      <p className="text-gray-300">{raffle.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isEnded ? (
                        <span className="px-4 py-2 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-400 font-semibold text-sm">
                          🔴 Ended
                        </span>
                      ) : (
                        <span className="px-4 py-2 bg-green-500 bg-opacity-20 border border-green-500 rounded text-green-400 font-semibold text-sm">
                          🟢 Active
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-black bg-opacity-50 p-3 rounded border border-amber-400 border-opacity-20">
                      <p className="text-xs text-gray-400 mb-1">Prize Pool</p>
                      <p className="text-lg font-bold text-amber-400">
                        {raffle.prizePool}
                      </p>
                    </div>
                    <div className="bg-black bg-opacity-50 p-3 rounded border border-amber-400 border-opacity-20">
                      <p className="text-xs text-gray-400 mb-1">Ticket Price</p>
                      <p className="text-lg font-bold text-amber-400">
                        {raffle.ticketPrice} cUSD
                      </p>
                    </div>
                    <div className="bg-black bg-opacity-50 p-3 rounded border border-amber-400 border-opacity-20">
                      <p className="text-xs text-gray-400 mb-1">
                        Total Entries
                      </p>
                      <p className="text-lg font-bold text-amber-400">
                        {raffle.entries}
                      </p>
                    </div>
                    <div className="bg-black bg-opacity-50 p-3 rounded border border-amber-400 border-opacity-20">
                      <p className="text-xs text-gray-400 mb-1">
                        Numbers Taken
                      </p>
                      <p className="text-lg font-bold text-amber-400">
                        {raffle.takenNumbers.length}/{raffle.numberRange}
                      </p>
                    </div>
                    <div className="bg-black bg-opacity-50 p-3 rounded border border-amber-400 border-opacity-20">
                      <p className="text-xs text-gray-400 mb-1">
                        Expected Winners
                      </p>
                      <p className="text-lg font-bold text-amber-400">
                        {raffle.expectedWinners}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm text-gray-400">
                        Number Distribution
                      </p>
                      <p className="text-sm font-semibold text-amber-400">
                        {progress}% filled
                      </p>
                    </div>
                    <div className="w-full bg-black bg-opacity-50 border border-amber-400 border-opacity-20 rounded h-2 overflow-hidden">
                      <div
                        className="h-full bg-amber-400 transition-all duration-500"
                        style={{
                          width: `${Math.min(parseFloat(progress), 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Taken Numbers Preview */}
                  {raffle.takenNumbers.length > 0 && (
                    <div className="mb-6 bg-black bg-opacity-30 p-4 rounded border border-amber-400 border-opacity-10">
                      <p className="text-sm text-gray-400 mb-2">
                        Taken Numbers:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {raffle.takenNumbers
                          .sort((a, b) => a - b)
                          .slice(0, 10)
                          .map((num) => (
                            <span
                              key={num}
                              className="px-2 py-1 bg-amber-400 bg-opacity-20 border border-amber-400 rounded text-xs text-amber-400 font-semibold"
                            >
                              {num}
                            </span>
                          ))}
                        {raffle.takenNumbers.length > 10 && (
                          <span className="px-2 py-1 text-xs text-gray-400">
                            +{raffle.takenNumbers.length - 10} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* End Date */}
                  <div className="mb-6 text-sm">
                    <p className="text-gray-400 mb-1">Ends At:</p>
                    <p className="text-amber-400 font-mono">
                      {new Date(raffle.endsAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 flex-wrap">
                    {!isEnded && (
                      <button
                        onClick={() => handleSimulatePurchase(raffle.id)}
                        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-500 transition-colors text-sm"
                      >
                        🧪 Simulate Purchase
                      </button>
                    )}
                    <button
                      onClick={() => setEditingRaffleId(raffle.id)}
                      className="px-4 py-2 bg-amber-600 text-white font-semibold rounded hover:bg-amber-500 transition-colors text-sm"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRaffle(raffle.id)}
                      className="px-4 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-500 transition-colors text-sm"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Create Raffle Tab */}
      {activeTab === "create" && (
        <div className="max-w-2xl">
          <form
            onSubmit={handleCreateRaffle}
            className="border-2 border-amber-400 border-opacity-30 rounded-lg p-8 bg-black bg-opacity-50"
          >
            {/* Title */}
            <h2 className="text-2xl font-bold text-amber-400 mb-6">
              Create New Raffle
            </h2>

            {/* Raffle Name */}
            <div className="mb-6">
              <label className="block text-gray-300 font-semibold mb-2">
                Raffle Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="e.g., Mega Spin"
                className="w-full px-4 py-3 bg-black border-2 border-amber-400/30 rounded text-white placeholder-gray-600 focus:border-opacity-100 outline-none transition-all"
              />
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-gray-300 font-semibold mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="Describe your raffle..."
                rows={3}
                className="w-full px-4 py-3 bg-black border-2 border-amber-400/30 rounded text-white placeholder-gray-600 focus:border-opacity-100 outline-none transition-all"
              />
            </div>

            {/* Ticket Price */}
            <div className="mb-6">
              <label className="block text-gray-300 font-semibold mb-2">
                Ticket Price (cUSD) *
              </label>
              <input
                type="number"
                min="0"
                step="any"
                name="ticketPrice"
                value={formData.ticketPrice}
                onChange={handleFormChange}
                placeholder="e.g., 5"
                className="w-full px-4 py-3 bg-black border-2 border-amber-400/30 rounded text-white focus:border-opacity-100 outline-none transition-all"
              />
            </div>

            {/* Start & End Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-300 font-semibold mb-2">
                  Start Date *
                </label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 bg-black border-2 border-amber-400/30 rounded text-white focus:border-opacity-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-2">
                  End Date *
                </label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 bg-black border-2 border-amber-400/30 rounded text-white focus:border-opacity-100 outline-none"
                />
              </div>
            </div>

            {/* Number Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-gray-300 font-semibold mb-2">
                  From Number *
                </label>
                <input
                  type="number"
                  name="fromNumber"
                  value={formData.fromNumber}
                  onChange={handleFormChange}
                  min="1"
                  className="w-full px-4 py-3 bg-black border-2 border-amber-400/30 rounded text-white outline-none focus:border-opacity-100"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-2">
                  To Number *
                </label>
                <input
                  type="number"
                  name="toNumber"
                  value={formData.toNumber}
                  onChange={handleFormChange}
                  min={formData.fromNumber || 1}
                  className="w-full px-4 py-3 bg-black border-2 border-amber-400/30 rounded text-white outline-none focus:border-opacity-100"
                />
              </div>

              {/* Warning if invalid */}
              {Number(formData.toNumber) <= Number(formData.fromNumber) && (
                <p className="text-red-400 col-span-2 text-sm">
                  ⚠ “To Number” must be greater than “From Number”.
                </p>
              )}
            </div>

            {/* Summary Section */}
            <div className="mb-8 p-4 bg-amber-400/5 border border-amber-400/20 rounded text-sm text-gray-300">
              <p className="font-semibold text-amber-400 mb-2">
                📊 Raffle Summary
              </p>

              {formData.fromNumber &&
              formData.toNumber &&
              formData.ticketPrice ? (
                (() => {
                  const from = Number(formData.fromNumber);
                  const to = Number(formData.toNumber);
                  const ticket = Number(formData.ticketPrice);

                  const totalEntries = to - from + 1;

                  // Calculate number of winners
                  const winners = Math.ceil(totalEntries / 10); // 1 per 10 entries

                  // Prize pool after 1% fee
                  const totalPrizePool = totalEntries * ticket * 0.99;

                  // Prize per winner
                  const prizePerWinner = totalPrizePool / winners;

                  return (
                    <>
                      <p>
                        Total Entries: <strong>{totalEntries}</strong>
                      </p>

                      <p>
                        Winners: <strong>{winners}</strong>
                      </p>

                      <p>
                        Prize Amount (each):{" "}
                        <strong>{prizePerWinner.toFixed(4)} cUSD</strong>
                      </p>

                      <p className="text-xs mt-2 opacity-70">
                        *Total prize pool distributed:{" "}
                        {totalPrizePool.toFixed(4)} cUSD (1% platform fee
                        included)
                      </p>
                    </>
                  );
                })()
              ) : (
                <p>Fill out the form to see calculations</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={
                Number(formData.toNumber) <= Number(formData.fromNumber) ||
                !formData.ticketPrice ||
                !formData.name ||
                !formData.startDate ||
                !formData.endDate
              }
              className="w-full px-6 py-3 bg-amber-400 text-black font-bold rounded hover:bg-amber-300 transition-colors shadow-lg disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isCreating ? "creating.." : "🎰 Create Raffle"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
