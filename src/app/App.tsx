import React, { useState } from 'react';
import { Sidebar } from '../modules/dashboard/Sidebar';
import { Header } from '../modules/dashboard/Header';
import { POSModule } from '../modules/pos/POSModule';
import { StockModule } from '../modules/stock/StockModule';
import { CustomersModule } from '../modules/customers/CustomersModule';
import { SuppliersModule } from '../modules/suppliers/SuppliersModule';
import { FinanceModule } from '../modules/finance/FinanceModule';
import { UsersModule } from '../modules/users/UsersModule';
import { PasswordPromptModal } from '../modules/auth/PasswordPromptModal';
import { useAppStore } from '../store/useAppStore';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('pos');
  const { currentUser, pendingAuthUser, setCurrentUser, setPendingAuthUser } = useAppStore();

  const canAccessUsers = currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER';

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 overflow-y-auto">
          {activeTab === 'pos' && <POSModule />}
          {activeTab === 'stock' && <StockModule />}
          {activeTab === 'customers' && <CustomersModule />}
          {activeTab === 'suppliers' && <SuppliersModule />}
          {activeTab === 'finance' && <FinanceModule />}
          {activeTab === 'users' && (canAccessUsers ? <UsersModule /> : <POSModule />)}
        </main>
      </div>

      {/* Global Centered Password Prompt Modal */}
      {pendingAuthUser && (
        <PasswordPromptModal
          targetUser={pendingAuthUser}
          onSuccess={() => {
            setCurrentUser(pendingAuthUser);
            setPendingAuthUser(null);
          }}
          onCancel={() => setPendingAuthUser(null)}
        />
      )}
    </div>
  );
};
