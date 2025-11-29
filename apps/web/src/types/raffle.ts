export interface Raffle {
  id: number;
  title: string;
  description: string;
  expectedWinners: number;
  winningPrice: string;
  blockchainId: number;
  ticketPrice: string;
  startNo: number;
  endNo: number;
  startDate: Date;
  endDate: Date;
  status: string;
  takenNos: string | null;
  chosenData: string | null;
}

export interface Ticket {
    id: number;
    raffleId: number;
    raffle: {
      id: number;
      title: string;
      description: string;
      ticketPrice: string;
      winningPrice: string;
      endDate: Date;
      status: string;
    };
    selectedNumbers: number[];
    amount: string;
    purchaseDate: Date;
    status: 'active' | 'won' | 'lost';
    winAmount?: string;
  }
  