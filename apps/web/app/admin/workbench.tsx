'use client';

import React, { useState } from 'react';
import { BILGEN_TOKENS } from '@bilgenos/ui';
import { AppSidebar, MainModuleId, NAV_GROUPS } from './components/AppSidebar';
import { AppHeader } from './components/AppHeader';
import { TransportationModule } from './modules/TransportationModule';
import { CampusAssetModule } from './modules/CampusAssetModule';
import { HrModule } from './modules/HrModule';
import { FinanceModule } from './modules/FinanceModule';
import { AcademicCommercialModule } from './modules/AcademicCommercialModule';
import { AuditSecurityModule } from './modules/AuditSecurityModule';

export function CoreAdministrationWorkbench(): React.ReactElement {
  const [activeModule, setActiveModule] = useState<MainModuleId>('TRANSPORTATION');
  const [activeSubTab, setActiveSubTab] = useState<string>('TRN_TRIPS');

  const handleSelectModule = (moduleId: MainModuleId) => {
    setActiveModule(moduleId);
    const group = NAV_GROUPS.find((g) => g.id === moduleId);
    if (group && group.items.length > 0) {
      setActiveSubTab(group.items[0].id);
    }
  };

  const currentGroup = NAV_GROUPS.find((g) => g.id === activeModule);
  const currentSubItem = currentGroup?.items.find((i) => i.id === activeSubTab);

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        backgroundColor: BILGEN_TOKENS.colors.canvas,
        fontFamily: BILGEN_TOKENS.typography.fontFamilySans,
      }}
    >
      {/* 1. Deep Slate Sidebar */}
      <AppSidebar
        activeModule={activeModule}
        onSelectModule={handleSelectModule}
        activeSubTab={activeSubTab}
        onSelectSubTab={setActiveSubTab}
      />

      {/* 2. Main Content Canvas */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        {/* Periodya Executive Header */}
        <AppHeader
          currentModuleTitle={currentGroup?.title || 'Modül'}
          currentSubTabTitle={currentSubItem?.label || 'Genel Bakış'}
        />

        {/* Dynamic Module Content View */}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            backgroundColor: BILGEN_TOKENS.colors.canvas,
          }}
        >
          {activeModule === 'TRANSPORTATION' && (
            <TransportationModule activeSubTab={activeSubTab} />
          )}
          {activeModule === 'CAMPUS_ASSET' && (
            <CampusAssetModule activeSubTab={activeSubTab} />
          )}
          {activeModule === 'HR' && <HrModule activeSubTab={activeSubTab} />}
          {activeModule === 'FINANCE' && <FinanceModule activeSubTab={activeSubTab} />}
          {activeModule === 'ACADEMIC_CRM' && (
            <AcademicCommercialModule activeSubTab={activeSubTab} />
          )}
          {activeModule === 'SECURITY' && (
            <AuditSecurityModule activeSubTab={activeSubTab} />
          )}
        </main>
      </div>
    </div>
  );
}
