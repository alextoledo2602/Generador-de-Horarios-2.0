"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BasicInfoSection from "@/components/basic-info-section";
import TimeSettingsSection from "@/components/time-settings-section";
import BalanceSection from "@/components/balance-section";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function ScheduleGenerator() {
	const [activeTab, setActiveTab] = useState("basic-info");
	const [completedSections, setCompletedSections] = useState({
		"basic-info": false,
		"time-settings": false,
		balance: false,
	});
  
	// Estado inicial adaptado a la nueva estructura de datos de la API
	const [formData, setFormData] = useState({
		basicInfo: {
			faculty: "",
			career: "",
			year: "",
			semester: 1,
			courseId: "",
			courseName: "",
			period: "",
			weeks: 14,
			subjects: [],
			subjectObjects: [],
		},
		timeSettings: {},
		balance: {
			maxLoad: 36,
			balanceValue: 100,
			balanceItems: Array(14).fill(36),
		},
	});

	// Actualiza la sección correspondiente del formData
	const updateFormData = (section, data) => {
		setFormData((prev) => ({
			...prev,
			[section]: {
				...prev[section],
				...data,
			},
		}));
	};

	// Marca una sección como completada y avanza a la siguiente
	const completeSection = (section) => {
		setCompletedSections((prev) => ({
			...prev,
			[section]: true,
		}));

		if (section === "basic-info") {
			setActiveTab("time-settings");
		} else if (section === "time-settings") {
			setActiveTab("balance");
		}
	};

	// Genera el horario (simulado)
	const generateSchedule = () => {
		console.log("Generating schedule with data:", formData);
		alert("Schedule generated successfully!");
	};

	// Traducción de textos de tabs
	const tabLabels = {
		"basic-info": "Información Básica",
		"time-settings": "Configuración de Horarios",
		balance: "Balance",
	};

	return (
		<div className="w-full min-h-screen py-10 px-0 bg-gray-300">
			<Card className="w-full max-w-7xl mx-auto bg-white shadow-xl border-2 border-white rounded-xl">
				<CardContent className="p-6">
					<Tabs
						value={activeTab}
						onValueChange={setActiveTab}
						className="w-full"
					>
						<TabsList className="grid w-full grid-cols-3 mb-8 bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg overflow-hidden">
							<TabsTrigger
								value="basic-info"
								disabled={
									activeTab !== "basic-info" &&
									!completedSections["basic-info"]
								}
								className={`flex items-center gap-2 transition-all duration-200 ${
									activeTab === "basic-info"
										? "tab-active"
										: "tab-inactive"
								}`}
							>
								{completedSections["basic-info"] && (
									<Check className="h-4 w-4" />
								)}
								{tabLabels["basic-info"]}
							</TabsTrigger>
							<TabsTrigger
								value="time-settings"
								disabled={
									!completedSections["basic-info"] ||
									(activeTab !== "time-settings" &&
										!completedSections["time-settings"])
								}
								className={`flex items-center gap-2 transition-all duration-200 ${
									activeTab === "time-settings"
										? "tab-active"
										: "tab-inactive"
								}`}
							>
								{completedSections["time-settings"] && (
									<Check className="h-4 w-4" />
								)}
								{tabLabels["time-settings"]}
							</TabsTrigger>
							<TabsTrigger
								value="balance"
								disabled={!completedSections["time-settings"]}
								className={`flex items-center gap-2 transition-all duration-200 ${
									activeTab === "balance"
										? "tab-active"
										: "tab-inactive"
								}`}
							>
								{completedSections["balance"] && <Check className="h-4 w-4" />}
								{tabLabels["balance"]}
							</TabsTrigger>
						</TabsList>

						<TabsContent value="basic-info" className="mt-0">
							<BasicInfoSection
								data={formData.basicInfo}
								updateData={(data) => updateFormData("basicInfo", data)}
								onComplete={() => completeSection("basic-info")}
							/>
						</TabsContent>

						<TabsContent value="time-settings" className="mt-0">
							<TimeSettingsSection
								data={{
									basicInfo: formData.basicInfo,
									timeSettings: formData.timeSettings,
								}}
								updateData={(data) => updateFormData("timeSettings", data)}
								onComplete={() => completeSection("time-settings")}
							/>
						</TabsContent>

						<TabsContent value="balance" className="mt-0">
							<BalanceSection
								data={formData}
								updateData={(data) => updateFormData("balance", data)}
								onComplete={() => completeSection("balance")}
							/>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
}
